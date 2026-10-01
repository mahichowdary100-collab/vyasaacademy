/* ============================================================
   Vyasa Academy Assistant - loader
   ------------------------------------------------------------
   Lazy-loads the widget assets (CSS + scripts) only after the
   page has finished loading, keeping the rest of the site fast
   and the widget free of any search-engine footprint harm.
   Include once on any page:
     <script src="/chatbot/chatbot-loader.js" defer></script>
   ============================================================ */
(function () {
  "use strict";

  if (window.VYASA_CHATBOT_LOADED) return;
  window.VYASA_CHATBOT_LOADED = true;

  var BASE = "/chatbot/";
  var ASSETS = [
    { type: "css", href: BASE + "chatbot-widget.css" },
    { type: "js", src: BASE + "chatbot-config.js" },
    { type: "js", src: BASE + "chatbot-kb.js" },
    { type: "js", src: BASE + "chatbot-widget.js" }
  ];

  function inject(asset) {
    return new Promise(function (resolve, reject) {
      var node;
      if (asset.type === "css") {
        node = document.createElement("link");
        node.rel = "stylesheet";
        node.href = asset.href;
      } else {
        node = document.createElement("script");
        node.src = asset.src;
        node.async = true;
      }
      node.onload = function () { resolve(); };
      node.onerror = function () { reject(new Error("failed to load " + (asset.src || asset.href))); };
      (document.head || document.documentElement).appendChild(node);
    });
  }

  function whenReady(cb) {
    if (document.readyState === "complete") {
      if (window.requestIdleCallback) requestIdleCallback(cb);
      else setTimeout(cb, 500);
    } else {
      window.addEventListener("load", function () {
        if (window.requestIdleCallback) requestIdleCallback(cb);
        else setTimeout(cb, 500);
      });
    }
  }

  whenReady(function () {
    var chain = Promise.resolve();
    for (var i = 0; i < ASSETS.length; i++) {
      (function (asset) {
        chain = chain.then(function () { return inject(asset); });
      })(ASSETS[i]);
    }
    chain.catch(function () { /* widget stays hidden if assets fail; site unaffected */ });
  });
})();