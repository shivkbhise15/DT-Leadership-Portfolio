

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. SIDEBAR TOGGLE ── */
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const main      = document.getElementById('main');

  let sidebarOpen = true;

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    // Tab slides: when sidebar collapses, tab moves to left:0
    hamburger.classList.toggle('sidebar-collapsed', !sidebarOpen);
    sidebar.classList.toggle('collapsed', !sidebarOpen);
    main.classList.toggle('expanded', !sidebarOpen);
  }

  hamburger.addEventListener('click', toggleSidebar);

  // Close sidebar on mobile when nav link clicked
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900 && sidebarOpen) toggleSidebar();
    });
  });


  /* ── 2. SMOOTH SCROLL NAV ── */
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href').replace('#', '');
      const target   = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ── 3. SCROLL SPY — highlight active nav item ── */
  const panels  = document.querySelectorAll('.panel');
  const navItems = document.querySelectorAll('.nav-item');

  function updateActiveNav() {
    let currentId = '';
    panels.forEach(panel => {
      const rect = panel.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.4) {
        currentId = panel.id;
      }
    });
    navItems.forEach(item => {
      const section = item.getAttribute('data-section');
      item.classList.toggle('active', section === currentId);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav(); // run on load


  /* ── 4. SCROLL-TRIGGERED PANEL REVEAL ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Animate bars inside this panel when it becomes visible
        animateBarsInPanel(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  panels.forEach(panel => revealObserver.observe(panel));


  /* ── 5. ANIMATE PROGRESS BARS ── */
  function animateBarsInPanel(panel) {
    // CSS bars (axis, kpi, gap) animate via CSS transition on --pct
    // But we need to trigger a reflow so transition fires
    const fills = panel.querySelectorAll(
      '.axis-bar-fill, .kpi-bar-fill, .gap-bar-fill, .rate-fill'
    );
    fills.forEach(fill => {
      const pct = fill.style.getPropertyValue('--pct') || fill.style.width;
      fill.style.setProperty('--pct', '0%');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fill.style.setProperty('--pct', pct);
        });
      });
    });
  }


  /* ── 6. SCORE RING ANIMATION ── */
  function animateScoreRing() {
    const ring = document.querySelector('.ring-fill');
    if (!ring) return;

    // Score is 71/100. Circumference = 2π × 52 ≈ 326.7
    // dashoffset for 71% = 326.7 × (1 - 0.71) = 94.7
    const circumference = 2 * Math.PI * 52;
    const score = 71;
    const targetOffset = circumference * (1 - score / 100);

    // Start from full offset (empty ring)
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;

    // Delay so transition is visible
    setTimeout(() => {
      ring.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)';
      ring.style.strokeDashoffset = targetOffset;
    }, 400);
  }

  // Run ring animation when executive panel becomes visible
  const execPanel = document.getElementById('executive');
  const ringObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateScoreRing();
      ringObserver.disconnect(); // run once
    }
  }, { threshold: 0.2 });
  if (execPanel) ringObserver.observe(execPanel);


  /* ── 7. STAGGERED STAT CARD ENTRANCE ── */
  function staggerElements(panel, selector, baseDelay = 80) {
    const els = panel.querySelectorAll(selector);
    els.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = `opacity 0.45s ease ${i * baseDelay}ms, transform 0.45s ease ${i * baseDelay}ms`;
    });
    return els;
  }

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const panel = entry.target;
      const id    = panel.id;

      if (id === 'executive') {
        const items = staggerElements(panel, '.exec-stat', 80);
        setTimeout(() => {
          items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
        }, 200);
      }
      if (id === 'contribution') {
        const items = staggerElements(panel, '.count-card, .ip-item', 60);
        setTimeout(() => {
          items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
        }, 150);
      }
      if (id === 'capability') {
        const items = staggerElements(panel, '.axis-card', 80);
        setTimeout(() => {
          items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
        }, 150);
      }
      if (id === 'kpi') {
        const items = staggerElements(panel, '.kpi-card, .kpi-summary-stat', 70);
        setTimeout(() => {
          items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
        }, 150);
      }
      if (id === 'constraints') {
        const items = staggerElements(panel, '.cst-item', 100);
        setTimeout(() => {
          items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
        }, 200);
      }
      if (id === 'trajectory') {
        const items = staggerElements(panel, '.traj-row, .gap-item', 80);
        setTimeout(() => {
          items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
        }, 200);
      }
    });
  }, { threshold: 0.1 });

  panels.forEach(panel => staggerObserver.observe(panel));


  /* ── 8. KEYBOARD NAV (accessibility) ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebarOpen && window.innerWidth <= 900) {
      toggleSidebar();
    }
  });


  /* ── 9. RESPONSIVE: auto-collapse on small screens ── */
  function handleResize() {
    if (window.innerWidth <= 900 && sidebarOpen) {
      sidebarOpen = false;
      hamburger.classList.add('sidebar-collapsed');
      sidebar.classList.add('collapsed');
      main.classList.add('expanded');
    }
  }

  handleResize(); // run on load
  window.addEventListener('resize', handleResize);


  /* ── 10. PROGRESS GROWTH ICONS: pulse on hover ── */
  document.querySelectorAll('.axis-growth-icon').forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.style.transition = 'transform 0.2s ease, letter-spacing 0.2s ease';
      icon.style.transform = 'translateY(-2px)';
      icon.style.letterSpacing = '4px';
    });
    icon.addEventListener('mouseleave', () => {
      icon.style.transform = '';
      icon.style.letterSpacing = '2px';
    });
  });

});