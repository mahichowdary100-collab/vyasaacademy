/* Optional pointer depth for locally hosted Class 9 chapter artwork. */
(function () {
  "use strict";

  function init() {
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.querySelectorAll(".cbse-visual-card .cbse-chapter-art").forEach(function (art) {
      var card = art.closest(".cbse-visual-card");
      if (!card) return;
      card.addEventListener("pointermove", function (event) {
        var box = card.getBoundingClientRect();
        var x = ((event.clientX - box.left) / box.width - 0.5) * 6;
        var y = ((event.clientY - box.top) / box.height - 0.5) * 4;
        art.style.setProperty("--parallax-x", x.toFixed(1) + "px");
        art.style.setProperty("--parallax-y", y.toFixed(1) + "px");
      });
      card.addEventListener("pointerleave", function () {
        art.style.setProperty("--parallax-x", "0px");
        art.style.setProperty("--parallax-y", "0px");
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
}());
