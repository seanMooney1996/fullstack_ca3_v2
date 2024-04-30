/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/sw_offline_first.js":
/*!*********************************!*\
  !*** ./src/sw_offline_first.js ***!
  \*********************************/
/***/ (() => {

eval("var cacheName = 'offline_pwa_example_version_1.0';\nconsole.log(\"in service helper\");\nvar filesToCache = ['manifest.json', 'index.html', './CSS/mainStyles.css'];\nconsole.log(\"in service helper\");\nself.addEventListener('install', function (e) {\n  e.waitUntil(caches.open(cacheName).then(function (cache) {\n    cache.addAll(filesToCache);\n    return true;\n  }));\n});\nconsole.log(\"in service helper\");\n// Delete old versions of the cache when a new version is first loaded\nself.addEventListener('activate', function (event) {\n  event.waitUntil(caches.keys().then(function (keys) {\n    return Promise.all(keys.map(function (key) {\n      if (!cacheName.includes(key)) {\n        return caches[\"delete\"](key);\n      }\n    }));\n  }));\n});\n\n// Fetch offline cached first, then online, then offline error page\nself.addEventListener('fetch', function (e) {\n  e.respondWith(caches.match(e.request).then(function (response) {\n    if (response)\n      // file found in cache\n      {\n        return response;\n      } else\n      // file found online\n      {\n        return fetch(e.request);\n      }\n  })[\"catch\"](function (e) {\n    // offline and not in cache\n    return caches.match('offline_message.html');\n  }));\n});\n\n//# sourceURL=webpack://fullstack_ca3_v2/./src/sw_offline_first.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/sw_offline_first.js"]();
/******/ 	
/******/ })()
;