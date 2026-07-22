(function () {
  const MAX = 4;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function play(el) {
    if (!el) return;
    if (!document.body.classList.contains('dark-mode')) return;
    if (reduce.matches) return;
    const n = 1 + Math.floor(Math.random() * MAX);
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'neon-warmup-' + n + ' 0.8s ease-out';
  }

  document.querySelectorAll('.menubar-link').forEach(function (link) {
    const label = link.querySelector('.label');
    link.addEventListener('mouseenter', function () { play(label); });
    link.addEventListener('mouseleave', function () {
      if (label) label.style.animation = 'none';
    });
  });

  ['.burger', '.theme-toggle', '.footer-bar a', '.title-logo'].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.addEventListener('mouseenter', function () { play(el); });
      el.addEventListener('mouseleave', function () { el.style.animation = 'none'; });
    });
  });

  const toggle = document.getElementById('menu-toggle');
  if (toggle) {
    toggle.addEventListener('change', function () {
      if (!toggle.checked) return;
      play(document.querySelector('.menubar-link.menubar-active .label'));
    });
  }
})();
