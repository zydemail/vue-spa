/**
 * @fileOverview 企鹅医典，医学科普头条
 * @author yeonzhou
 * @version v1.0.5
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.VueNavigation = factory());
}(this, (function () { 'use strict';

var routes = [];

if (window.sessionStorage.VUE_NAVIGATION) {
  routes = JSON.parse(window.sessionStorage.VUE_NAVIGATION);
}

var Routes = routes;

function genKey() {
  var t = 'xxxxxxxx';
  return t.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

function getKey(route, keyName) {
  return (route.name || route.path) + '?' + route.query[keyName];
}

function matches(pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1;
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1;
  }
  return false;
}
function remove(arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}

function pruneCacheEntry(cache, key, keys, current) {
  var cached = cache[key];
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}
function isObjEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  } else {
    var keys1 = Object.getOwnPropertyNames(obj1);
    var keys2 = Object.getOwnPropertyNames(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = keys1[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return true;
  }
}

var Navigator = (function (bus, moduleName, keyName) {
  var forward = function forward(name, toRoute, fromRoute) {
    var to = { route: toRoute };
    var from = { route: fromRoute };
    var routes = Routes;

    from.name = routes[routes.length - 1] || null;
    to.name = name;
    routes.push(name);
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes);
    bus.$emit('forward', to, from);
  };
  var back = function back(count, toRoute, fromRoute) {
    var to = { route: toRoute };
    var from = { route: fromRoute };
    var routes = Routes;
    from.name = routes[routes.length - 1];
    to.name = routes[routes.length - 1 - count];
    routes.splice(Routes.length - count, count);
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes);
    bus.$emit('back', to, from);
  };
  var replace = function replace(name, toRoute, fromRoute) {
    var to = { route: toRoute };
    var from = { route: fromRoute };
    var routes = Routes;

    from.name = routes[routes.length - 1] || null;
    to.name = name;
    routes.splice(Routes.length - 1, 1, name);
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes);
    bus.$emit('replace', to, from);
  };
  var refresh = function refresh(toRoute, fromRoute) {
    var to = { route: toRoute };
    var from = { route: fromRoute };
    var routes = Routes;
    to.name = from.name = routes[routes.length - 1];
    bus.$emit('refresh', to, from);
  };
  var reset = function reset() {
    Routes.splice(0, Routes.length);
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify([]);
    bus.$emit('reset');
  };

  var record = function record(toRoute, fromRoute, replaceFlag) {
    var name = getKey(toRoute, keyName);
    if (replaceFlag) {
      replace(name, toRoute, fromRoute);
    } else {
      var toIndex = Routes.lastIndexOf(name);
      if (toIndex === -1) {
        forward(name, toRoute, fromRoute);
      } else if (toIndex === Routes.length - 1) {
        refresh(toRoute, fromRoute);
      } else {
        back(Routes.length - 1 - toIndex, toRoute, fromRoute);
      }
    }
  };

  return {
    record: record, reset: reset
  };
});

var NavComponent = (function (keyName) {
  return {
    name: 'navigation',
    abstract: true,
    props: {
      include: [String, Array],
      exclude: [String, Array],
      max: [String, Number]
    },
    data: function data() {
      return {
        routes: Routes
      };
    },
    computed: {},
    watch: {
      routes: function routes(val) {
        for (var key in this.cache) {
          if (!matches(val, key)) {
            var vnode = this.cache[key];
            vnode && vnode.componentInstance.$destroy();
            delete this.cache[key];
          }
        }
      }
    },
    created: function created() {
      this.cache = {};
      this.keys = [];
    },
    destroyed: function destroyed() {
      for (var key in this.cache) {
        pruneCacheEntry(this.cache, key, this.keys);
      }
    },
    render: function render() {
      var vnode = this.$slots.default ? this.$slots.default[0] : null;
      if (vnode) {
        vnode.key = vnode.key || (vnode.isComment ? 'comment' : vnode.tag);
        var cache = this.cache,
            keys = this.keys;

        var key = getKey(this.$route, keyName);
        if (vnode.key.indexOf(key) === -1) {
          vnode.key = '__navigation-' + key + '-' + vnode.key;
        }
        if (cache[key]) {
          if (vnode.key === cache[key].key) {
            vnode.componentInstance = cache[key].componentInstance;
          } else {
            cache[key].componentInstance.$destroy();
            cache[key] = vnode;
          }
          remove(keys, key);
          keys.push(key);
        } else {
          cache[key] = vnode;
          keys.push(key);

          if (this.max && keys.length > parseInt(this.max)) {
            pruneCacheEntry(cache, keys[0], keys, this._vnode);
          }
        }
        vnode.data.keepAlive = true;
      }
      return vnode;
    }
  };
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var index = {
  install: function install(Vue) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        router = _ref.router,
        _ref$moduleName = _ref.moduleName,
        moduleName = _ref$moduleName === undefined ? 'navigation' : _ref$moduleName,
        _ref$keyName = _ref.keyName,
        keyName = _ref$keyName === undefined ? 'VNK' : _ref$keyName;

    if (!router) {
      console.error('vue-navigation need options: router');
      return;
    }

    var bus = new Vue();
    var navigator = Navigator(bus, moduleName, keyName);

    var routerReplace = router.replace.bind(router);
    var replaceFlag = false;
    router.replace = function (location, onComplete, onAbort) {
      replaceFlag = true;
      routerReplace(location, onComplete, onAbort);
    };

    router.beforeEach(function (to, from, next) {
      if (!to.query[keyName]) {
        var query = _extends({}, to.query);

        if (to.path === from.path && isObjEqual(_extends({}, to.query, _defineProperty({}, keyName, null)), _extends({}, from.query, _defineProperty({}, keyName, null))) && from.query[keyName]) {
          replaceFlag = true;
        }
        query[keyName] = genKey();
        next({
          path: to.path,
          query: query,
          replace: replaceFlag || !from.query[keyName],
          hash: to.hash || ''
        });
      } else {
        next();
      }
    });

    router.afterEach(function (to, from) {
      navigator.record(to, from, replaceFlag);
      replaceFlag = false;
    });

    Vue.component('navigation', NavComponent(keyName));

    Vue.navigation = Vue.prototype.$navigation = {
      on: function on(event, callback) {
        bus.$on(event, callback);
      },
      once: function once(event, callback) {
        bus.$once(event, callback);
      },
      off: function off(event, callback) {
        bus.$off(event, callback);
      },
      getRoutes: function getRoutes() {
        return Routes.slice();
      },
      cleanRoutes: function cleanRoutes() {
        return navigator.reset();
      }
    };
  }
};

return index;

})));
