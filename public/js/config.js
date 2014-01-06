(function() {
    var development = true;
    var _ts = new Date().getTime();
    var plugins = [];
    var map = [];
    if(development) { // 开发模式
        var dist = 'public/js/dist/';
        var src = 'js/'

        map.push(function(url) {
            if(url.indexOf(dist) > 0) {
                url = url.replace(dist, src);
            }
            if(url.indexOf('_ts=') === -1) {
                url += (url.indexOf('?') === -1 ? '?' : '&') + '_ts=' + _ts;
            }
            return url;
        });
    }

    seajs.development = development;
    if(seajs.vuse) {
        seajs.vuse.updateConfirm = function() {
            return true;
        };
    }
    seajs.config({
        plugins: plugins,
        map: map,
        alias: {
            $: 'mobi/$.js',
            jquery: 'jquery/jquery.js',
            helper: 'dist/app/helper.js',
            'highcharts': 'highcharts/highcharts.js',
            'seajs-debug': 'seajs/seajs-debug'
        }
    });
})();
