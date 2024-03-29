/**
 * 提供AJAX扩展，包括：
 *     配合后端JSON格式化处理，包含无权限，异常等操作
 *     AJAX单例模式
 */
define(function(require, exports, module) {
    var lang = require('./lang');
    var $ = require('./ajax');

    var single = {}; // 挂载ajax单例命名空间
    var config = {
        loginPage: '/',
        noPermissionAction: function() {
            location.href = config.loginPage;
        },
        errorAction: function(xhr, status) {

        }
    };
    var defaultRule = {
        /**
         * 默认判断成功的条件，默认是返回JSON并且其中具有code属性值200
         */
        success: function(data) {
            return data && (+data.code) === 200;
        },
        /**
         * 默认判断无权限的条件，默认是返回JSON并且其中具有code属性值401
         */
        permission: function(data) {
            return data && (+data.code) === 401;
        }
    };
    /**
     *
     * @param data 服务端返回值
     * @param p {Object} ajax配置参数
     * @param type {String} success/permission
     * @returns {boolean}
     */
    var rule = function(data, p, type) {
        var fn;
        if(p && p.rule && lang.isFunction(p.rule[type])) {
            fn = p.rule[type];
        } else {
            fn = defaultRule[type];
        }
        return fn(data) === true;
    };

    var r = {
        /**
         * 设置默认的成功判断规则
         * @param callback
         */
        setSuccessRule: function(callback) {
            defaultRule.success = function(data) {
                return callback(data);
            };
            r.setSuccessRule = null;
        },
        /**
         * 设置默认的无权限判断规则
         * @param callback
         */
        setPermissionRule: function(callback) {
            defaultRule.permission = function(data) {
                return callback(data);
            };
            r.setPermissionRule = null;
        },
        /**
         * 设置无权限时候的默认动作，该方法只能用一次
         * @param callback
         */
        setNoPermissionAction: function(callback) {
            config.noPermissionAction = callback;
            r.setNoPermissionAction = null;
        },
        /**
         * 设置失败时候的默认动作，该方法只能用一次
         * @param callback
         */
        setErrorAction: function(callback) {
            config.errorAction = callback;
            r.setErrorAction = null;
        },
        /**
         * 基类ajax，要求服务端返回的结果格式必须是JSON，建议按code,data格式返回，如：
         * {
         *     code: 状态码，一般就以下三个：200成功/400失败/401无权限
         *     data: 返回的数据源
         * }
         * 如果规则不是这样，可以使用 setSuccessRule 和 setPermissionRule 来设置，其他的表示失败
         * @param {Object} params
         *     在ajax的参数基础上增加了
         *         rule.success: 判定服务端成功的条件，优先级高于默认设定，默认data.code === 200
         *         rule.permission: 判定服务端无权限的条件，优先级高于默认设定，默认data.code === 401
         *         permission: 无权限时候的回调函数
         * @return {Object} XMLHttpRequrest对象
         */
        base: function(params) {
            var obj = lang.extend({}, params || {});
            if(!obj.before || (obj.before && obj.before() !== false)) {
                obj.dataType = 'json';
                obj.type = params.type || 'GET';
                obj.success = function(data) {
                    if(rule(data, obj, 'success')) { // 成功
                        if(params.success) {
                            params.success(data);
                        }
                    } else if(rule(data, obj, 'permission')) { // 无权限
                        lang.isFunction(params.permission) ? params.permission(data) : config.noPermissionAction();
                    } else { // 服务端判定失败
                        lang.isFunction(params.error) ? params.error(data) : config.errorAction(data);
                    }
                };
                obj.error = function(xhr, status) {
                    if(status !== 'abort') { // 主动放弃，这种一般是程序控制，不应该抛出error
                        lang.isFunction(params.error) ? params.error(xhr, status) : config.errorAction(xhr, status);
                    }
                };
                obj.complete = function(xhr, status) {
                    if(lang.isFunction(params.complete)) {
                        params.complete(xhr, status);
                    }
                };
                return $.ajax(obj);
            }
        },
        /**
         * AJAX单例模式：
         *     如果请求资源和上一次相同，则放弃后来的请求
         *     如果请求资源和上一次不同，则中断之前的请求，使用后面的请求
         * @param {String} name 单例命名空间
         * @return {Object} 返回对创建的单例的操作方法：发起请求send，放弃请求abort
         */
        single: function(name) {
            if(!single[name]) {
                single[name] = {};
            }
            var actions = {
                /**
                 * 发起一个AJAX单例请求
                 * @param params 同base方法的参数
                 * @return {undefined}
                 */
                send: function(params) {
                    var flag = single[name].url && (params.url === single[name].url);
                    if(flag) { // 请求URL相同
                        for(var i in params.data) {
                            if(params.data[i] !== single[name].data[i]) { // 请求的数据也相同，则认为是发起同一个请求
                                flag = false;
                                break;
                            }
                        }
                    }
                    if(flag) { // 请求的URL和参数相同则保留上一个
                        return false;
                    } else { // 不相同则放弃前一个请求
                        if(single[name].xhr) {
                            single[name].xhr.abort();
                        }
                    }
                    var completeFn = params.complete;
                    params.complete = function(xhr, status) {
                        if($.isFunction(completeFn)) {
                            completeFn(xhr, status);
                        }
                    };
                    single[name] = {
                        xhr: r.base(params),
                        url: params.url,
                        data: params.data
                    };
                },
                /**
                 * 放弃单例AJAX请求
                 */
                abort: function() {
                    if(single[name] && single[name].xhr && single[name].xhr.readyState !== 4) {
                        single[name].xhr.abort();
                        single[name].xhr = null;
                    }
                }
            };
            return actions;
        }
    };
    module.exports = r;
});