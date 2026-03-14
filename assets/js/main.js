/* ========================================
   ProDent — main.js
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Scroll progress bar ── */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      progressBar.style.width = scrolled + '%';
    }, { passive: true });
  }

  /* ── Sticky header ── */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ── Mobile menu ── */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu__close');
  const mobileOverlay = document.querySelector('.mobile-menu__overlay');

  function openMenu() {
    mobileMenu?.classList.add('open');
    document.body.style.overflow = 'hidden';
    burger?.classList.add('active');
  }

  function closeMenu() {
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
    burger?.classList.remove('active');
  }

  burger?.addEventListener('click', openMenu);
  mobileClose?.addEventListener('click', closeMenu);
  mobileOverlay?.addEventListener('click', closeMenu);

  document.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ── Active nav link ── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .mobile-nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Back to top ── */
  const btt = document.querySelector('.back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 88;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ── AOS Init ── */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      once: true,
      offset: 80,
      easing: 'ease-out-cubic'
    });
  }

  /* ── Counter animation ── */
  const counters = document.querySelectorAll('[data-counter]');

  function animateCounter(el) {
    const target = +el.getAttribute('data-counter');
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);
      el.textContent = prefix + current.toLocaleString('ru-RU') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (counters.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  /* ── Pricing tabs ── */
  const pricingTabs = document.querySelectorAll('.pricing__tab');
  const pricingPanels = document.querySelectorAll('.pricing__panel');

  pricingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      pricingTabs.forEach(t => t.classList.remove('active'));
      pricingPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(target)?.classList.add('active');
    });
  });

  /* ── Service Calculator ── */
  const calcItems = document.querySelectorAll('.calc__item');
  const calcTotal = document.getElementById('calcTotal');
  const calcDiscountRow = document.getElementById('calcDiscountRow');
  const calcDiscount = document.getElementById('calcDiscount');
  const calcSelectedList = document.getElementById('calcSelectedList');
  const calcEmpty = document.getElementById('calcEmpty');
  const calcNote = document.getElementById('calcNote');

  let selected = {};

  function updateCalculator() {
    selected = {};
    calcItems.forEach(item => {
      if (item.classList.contains('checked')) {
        const name = item.getAttribute('data-name');
        const price = +item.getAttribute('data-price');
        selected[name] = price;
      }
    });

    const entries = Object.entries(selected);
    const subtotal = entries.reduce((s, [, p]) => s + p, 0);
    const count = entries.length;
    const discountPct = count >= 3 ? 0.10 : count >= 2 ? 0.05 : 0;
    const discountAmt = Math.round(subtotal * discountPct);
    const total = subtotal - discountAmt;

    // Selected list
    if (calcSelectedList) {
      if (count === 0) {
        calcEmpty?.style && (calcEmpty.style.display = 'flex');
        calcSelectedList.style.display = 'none';
      } else {
        calcEmpty?.style && (calcEmpty.style.display = 'none');
        calcSelectedList.style.display = 'flex';
        calcSelectedList.innerHTML = entries.map(([name, price]) => `
          <div class="calc__selected-item">
            <span class="calc__selected-item-name">${name}</span>
            <span class="calc__selected-item-price">${price.toLocaleString('ru-RU')} ₽</span>
          </div>
        `).join('');
      }
    }

    // Discount row
    if (calcDiscountRow) {
      if (discountAmt > 0) {
        calcDiscountRow.style.display = 'flex';
        calcDiscount.textContent = `−${discountAmt.toLocaleString('ru-RU')} ₽ (${Math.round(discountPct * 100)}%)`;
      } else {
        calcDiscountRow.style.display = 'none';
      }
    }

    if (calcTotal) {
      calcTotal.textContent = total.toLocaleString('ru-RU') + ' ₽';
    }

    if (calcNote) {
      if (count === 1) calcNote.textContent = 'Выберите ещё 1 услугу — скидка 5%';
      else if (count === 2) calcNote.textContent = 'Выберите ещё 1 услугу — скидка 10%';
      else if (count >= 3) calcNote.textContent = 'Вы получаете максимальную скидку 10%!';
      else calcNote.textContent = 'При выборе 2+ услуг действует скидка';
    }
  }

  calcItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      const checkbox = item.querySelector('.calc__checkbox');
      if (checkbox) {
        checkbox.innerHTML = item.classList.contains('checked')
          ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : '';
      }
      updateCalculator();
    });
  });

  updateCalculator();

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq__question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq__item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq__item.open').forEach(i => i.classList.remove('open'));

      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Testimonials Swiper ── */
  if (typeof Swiper !== 'undefined') {
    new Swiper('.testimonials-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      breakpoints: {
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });
  }

  /* ── Cookie banner ── */
  const cookieBanner = document.querySelector('.cookie-banner');
  const cookieAccept = document.getElementById('cookieAccept');

  if (cookieBanner && !localStorage.getItem('cookieAccepted')) {
    setTimeout(() => cookieBanner.classList.add('visible'), 1500);
  }

  cookieAccept?.addEventListener('click', () => {
    cookieBanner?.classList.remove('visible');
    localStorage.setItem('cookieAccepted', '1');
  });

  /* ── Hero scroll indicator ── */
  document.querySelector('.hero__scroll')?.addEventListener('click', () => {
    const next = document.querySelector('.features-strip') || document.querySelector('.section');
    if (next) {
      next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ── Form submission (prevent default, show success) ── */
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const originalText = btn?.textContent;
      if (btn) {
        btn.textContent = '✓ Заявка отправлена!';
        btn.disabled = true;
        btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
      }
      setTimeout(() => {
        if (btn) {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
        }
        form.reset();
      }, 3000);
    });
  });

  /* ── Parallax on hero shapes ── */
  const shape1 = document.querySelector('.hero__bg-shape--1');
  const shape2 = document.querySelector('.hero__bg-shape--2');

  if (shape1 || shape2) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (shape1) shape1.style.transform = `translateY(${y * 0.15}px)`;
      if (shape2) shape2.style.transform = `translateY(${-y * 0.1}px)`;
    }, { passive: true });
  }

  /* ── Blog card featured image lazy hover ── */
  document.querySelectorAll('.blog-card').forEach(card => {
    const img = card.querySelector('.blog-card__img img');
    if (!img) return;
    card.addEventListener('mouseenter', () => { img.style.transform = 'scale(1.05)'; });
    card.addEventListener('mouseleave', () => { img.style.transform = 'scale(1)'; });
  });

  /* ── Highlight current page nav ── */
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav__link, .mobile-nav__link, .footer__nav-link').forEach(link => {
    if (link.getAttribute('href') === page) {
      link.classList.add('active');
    }
  });

});
