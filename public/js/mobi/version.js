!function(a){var b=144e4,c=2e4,d=function(){},e="|||",f=window.localStorage,g={getExtension:function(a){var b=a.split(".");return b[b.length-1]},eval:function(a){var b=eval;b(a)},importStyle:function(a){var b=document.createElement("style");document.getElementsByTagName("head")[0].appendChild(b),b.styleSheet?b.styleSheet.cssText=a:b.appendChild(document.createTextNode(a))},ajax:function(a,b,e,f){var g,h=new window.XMLHttpRequest;if(isNaN(parseInt(f,10))&&(f=c),h){var i=/^([\w-]+:)\/\//.test(a)?RegExp.$1:window.location.protocol;h.open("GET",a,!0),h.onreadystatechange=function(){4===h.readyState&&(h.onreadystatechange=d,clearTimeout(g),h.status>=200&&h.status<300||304===h.status||0===h.status&&"file:"===i?"function"==typeof b&&b(h.responseText):"function"==typeof e&&e(h))},f>0&&(g=setTimeout(function(){h.onreadystatechange=d,h.abort(),"function"==typeof e&&e(h)},f)),h.send(null)}return h},getMain:function(a){var b,c=/define\(['"]([^"']+)['"]/,d=a.match(c);return d&&(b=d[1]),b},localRun:function(b,c,d,e){b?"script"===d?(g.eval(b),a.use(g.getMain(b),c)):"css"===d&&g.importStyle(b):"function"==typeof a.vuse.localNotFound&&a.vuse.localNotFound()},remoteRun:function(a,b,d,h,i){var j=-1===a.indexOf("?")?"?":"&";j=a+j+"__t="+ +new Date,g.ajax(j,function(b){g.localRun(b,d,h,!1),f.setItem(a,i+e+b)},function(){g.localRun(b,d,h,!0)},c)}};a.vuse=function(b){var c=a.resolve(b.url),h=(b.version||+new Date)+"",i=b.callback||d,j=b.type,k=b.force;if(a.development)a.use(c,i);else{var l,m,n,o=f.getItem(c),p=g.getExtension(c),q=!p||"js"===p||"script"===j,r="css"===p||"css"===j;j=q?"script":r?"css":"",o&&(l=o.split(e),m=l[1],n=l[0]),navigator.onLine&&-1===location.href.indexOf("offline")?k===!0?g.remoteRun(c,m,i,j,h):o?n===h?g.localRun(m,i,j):g.remoteRun(c,m,i,j,h):g.remoteRun(c,m,i,j,h):g.localRun(m,i,j,!0)}},a.duse=function(b){b=a.resolve(b);var c=f.getItem(b);c&&f.removeItem(b)};try{applicationCache.update()}catch(h){}a.development||(applicationCache.update(),setInterval(function(){applicationCache.update()},b),applicationCache.addEventListener("updateready",function(){"function"==typeof a.vuse.updateConfirm?a.vuse.updateConfirm()!==!1&&(applicationCache.swapCache(),location.reload()):(applicationCache.swapCache(),location.reload())},!0))}(seajs);