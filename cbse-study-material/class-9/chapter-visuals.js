/* Progressive enhancement for local Class 9 chapter art. Static SVG <use>
   instances remain in the HTML as a no-JavaScript and fetch-failure fallback. */
(function () {
  "use strict";

  var spriteUrl = "/cbse-study-material/class-9/chapter-art.svg";
  var svgNS = "http://www.w3.org/2000/svg";
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sourcePromise;

  function getSprite() {
    if (!sourcePromise) {
      sourcePromise = fetch(spriteUrl, { credentials: "same-origin", cache: "force-cache" })
        .then(function (response) {
          if (!response.ok) throw new Error("chapter art unavailable");
          return response.text();
        })
        .then(function (xml) {
          var doc = new DOMParser().parseFromString(xml, "image/svg+xml");
          if (doc.querySelector("parsererror")) throw new Error("invalid chapter art");
          return doc;
        });
    }
    return sourcePromise;
  }

  function enhanceArt(host) {
    var artId = host.getAttribute("data-art-id");
    var svg = host.querySelector("svg");
    if (!artId || !svg || reducedMotion) return;
    getSprite().then(function (doc) {
      var symbol = doc.getElementById(artId);
      if (!symbol) return;
      var group = document.createElementNS(svgNS, "g");
      group.setAttribute("class", "cbse-scene-enhanced");
      Array.prototype.forEach.call(symbol.childNodes, function (node) {
        if (node.nodeType === 1) group.appendChild(document.importNode(node, true));
      });
      if (!group.childNodes.length) return;
      svg.replaceChildren(group);
      host.classList.add("cbse-art-enhanced");
    }).catch(function () { /* keep the static external SVG poster */ });
  }

  function init() {
    var art = Array.prototype.slice.call(document.querySelectorAll(".cbse-chapter-art[data-art-id]"));
    if (!art.length) return;
    art.forEach(enhanceArt);

    if ("IntersectionObserver" in window && !reducedMotion) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("cbse-art-visible", entry.isIntersecting);
        });
      }, { rootMargin: "80px", threshold: 0.05 });
      art.forEach(function (node) { observer.observe(node); });
    }

    if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion) {
      document.querySelectorAll(".cbse-visual-card .cbse-chapter-art").forEach(function (host) {
        var card = host.closest(".cbse-visual-card");
        if (!card) return;
        card.addEventListener("pointermove", function (event) {
          var box = card.getBoundingClientRect();
          var x = ((event.clientX - box.left) / box.width - 0.5) * 8;
          var y = ((event.clientY - box.top) / box.height - 0.5) * 6;
          host.style.setProperty("--parallax-x", x.toFixed(1) + "px");
          host.style.setProperty("--parallax-y", y.toFixed(1) + "px");
        });
        card.addEventListener("pointerleave", function () {
          host.style.setProperty("--parallax-x", "0px");
          host.style.setProperty("--parallax-y", "0px");
        });
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
}());
