var n,t,r=[],e=new(WeakMap||Map),u=window.___hookusPocusRunMap||new(WeakMap||Map);window.___hookusPocusRunMap=u;var o=function(u){return function o(){var i=r[t][++n]||(r[t][n]=[{context:r[t][0],hook:u}]);return(e.get(o)||u).apply({},i.concat(Array.from(arguments)))}},i=function(n,e){var o=r[t].map(function(n){if(n[0]&&n[0][e]){var t=n[0][e]();return n[0][e]=0,t}}).filter(function(n){return n instanceof Promise});if(o.length>0){var i=Promise.all(o);u.set(n,u.has(n)?u.get(n).then(i):i)}},a=function(n,t){if(u.has(n)){var r=u.get(n).then(t);return u.set(n,r),r}return t()},f=function(){var o,f=Array.from(arguments);return f[0].pop&&(o=f.shift()),function(o,f,c,s){if(!0!==f)return a(o,function(){return n=0,t=r.push(e.get(o)||[o])-1,e.set(o,r[t]),i(o,"before"),a(o,function(){var n=c.apply(c,s);return i(o,"after"),a(o,function(){return r.pop(),u.delete(o),n})})});u.set(o,i(o,"cleanUp")),e.delete(o)}("boolean"==typeof f[1]?f[0]:f[1]||f[0],!0===f[1]||f[2],f[0],o)},c=o(function(n,t,r,e){return n.s=void 0!==n.s?n.s:e?e(r):r,[n.s,function(r){return n.s=t(n.s,r),n.s}]}),s=function(n,t){e.set(n,t)},p=function(n){return s(c,function(t,r,e,u){var o=t.hook(t,r,e,u),i=o[0],a=o[1];return[i,function(r){var e=a(r);return i!==e&&n(t.context),e}]})},v=o(function(n,t,r){n.v&&(!r||r.length===n.v.length&&r.every(function(t){return~n.v.indexOf(t)}))||(n.v=r,n.cleanUp&&n.cleanUp(),n.after=function(){var r=t();return r instanceof Promise?r=r.then(function(t){return n.cleanUp=t}):n.cleanUp=r,r})}),l=function(n,t){v(function(){return new Promise(function(t){return requestAnimationFrame(function(r){return t(n())})})},t)},h=function(n){var t=c(function(n,t){return t.value},n),r=t[1];return[t[0],function(n){return r({value:n})}]},m=function(n,t){var r=function(){var r=Array.from(arguments);return r.length>0?f(r,n,t):f(n,t)};return r.cleanUp=function(){f(n,t,!0)},r};export{s as on,p as onStateChanged,o as hookus,f as pocus,v as useLayoutEffect,l as useEffect,c as useReducer,h as useState,m as fidibus};
//# sourceMappingURL=hookuspocus.mjs.map
