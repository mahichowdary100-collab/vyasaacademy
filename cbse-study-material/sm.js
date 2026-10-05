// ===== CBSE STUDY MATERIAL : NAVBAR + SEARCH/FILTER =====
(function () {
  'use strict';

  var burger = document.getElementById('hamburger');
  var links = document.getElementById('navLinks');

  if (burger && links) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      links.classList.toggle('show');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        burger.classList.remove('open');
        links.classList.remove('show');
      }
    });
  }

  var nav = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  var input = document.getElementById('smSearch');
  var grid = document.getElementById('smGrid');
  var empty = document.getElementById('smEmpty');

  if (input && grid) {
    var cards = grid.querySelectorAll('.sm-card[data-search]');
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var any = false;
      for (var i = 0; i < cards.length; i++) {
        var hit = !q || (cards[i].getAttribute('data-search') || '').toLowerCase().indexOf(q) !== -1;
        cards[i].style.display = hit ? '' : 'none';
        if (hit) any = true;
      }
      if (empty) empty.hidden = any;
    });
  }
})();