(function() {
  'use strict';

  var nav, backdrop, startX, currentX, isDragging;

  function init() {
    nav = document.getElementById('mainNav');
    if (!nav) return;

    if (!document.getElementById('navBackdrop')) {
      backdrop = document.createElement('div');
      backdrop.className = 'gn-nav-backdrop';
      backdrop.id = 'navBackdrop';
      document.body.appendChild(backdrop);
    } else {
      backdrop = document.getElementById('navBackdrop');
    }

    backdrop.addEventListener('click', close);

    nav.addEventListener('touchstart', onTouchStart, { passive: true });
    nav.addEventListener('touchmove', onTouchMove, { passive: false });
    nav.addEventListener('touchend', onTouchEnd, { passive: true });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') close();
    });
  }

  function open() {
    if (!nav) return;
    nav.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.classList.add('nav-open');
  }

  function close() {
    if (!nav) return;
    nav.style.transform = '';
    nav.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  function onTouchStart(e) {
    startX = e.touches[0].clientX;
    currentX = startX;
    isDragging = false;
  }

  function onTouchMove(e) {
    currentX = e.touches[0].clientX;
    var dx = currentX - startX;
    if (dx > 10) {
      isDragging = true;
      e.preventDefault();
      nav.style.transition = 'none';
      nav.style.transform = 'translateX(' + Math.max(0, dx) + 'px)';
      if (backdrop) {
        var progress = Math.max(0, 1 - dx / nav.offsetWidth);
        backdrop.style.opacity = progress;
      }
    }
  }

  function onTouchEnd() {
    if (!isDragging) return;
    nav.style.transition = '';
    nav.style.transform = '';
    if (backdrop) backdrop.style.opacity = '';
    var dx = currentX - startX;
    if (dx > 80) {
      close();
    }
    isDragging = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.gnNav = { open: open, close: close };
})();
