/* =========================================
   LivMarkins — script.js (V2)
   ========================================= */

/* ===== Splash (home only, safe no-op elsewhere) ===== */
(function () {
  const splash = document.getElementById('splash');
  const vid = document.getElementById('splashVideo');
  if (!splash || !vid) {
    document.body.classList.add('page-ready');
    return;
  }

  const finish = () => {
    if (!splash.classList.contains('hide')) {
      splash.classList.add('hide');
      document.body.classList.add('page-ready');
    }
  };

  vid.addEventListener('ended', finish);
  splash.addEventListener('click', finish);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') finish(); });

  const tryPlay = () => {
    if (vid.paused) { vid.play().catch(() => {}); }
    window.removeEventListener('pointerdown', tryPlay, { passive: true });
  };
  window.addEventListener('pointerdown', tryPlay, { passive: true });

  let safetyTimer = setTimeout(finish, 12000);
  const setDurationTimer = () => {
    clearTimeout(safetyTimer);
    const dur = (isFinite(vid.duration) && vid.duration > 0) ? vid.duration : 6;
    const ms = Math.min((dur * 1000) + 800, 12000);
    safetyTimer = setTimeout(finish, ms);
  };
  if (isFinite(vid.duration) && vid.duration > 0) setDurationTimer();
  else vid.addEventListener('loadedmetadata', setDurationTimer, { once: true });

  vid.addEventListener('error', () => setTimeout(finish, 1200), { once: true });
})();

/* ===== Header scroll effects: shrink + progress bar ===== */
(function () {
  const header = document.querySelector('header');
  const progress = document.querySelector('.scroll-progress');
  if (!header && !progress) return;

  let ticking = false;
  const update = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 12);
    if (progress) {
      const h = document.documentElement;
      const max = (h.scrollHeight - h.clientHeight) || 1;
      progress.style.width = Math.min(100, (y / max) * 100) + '%';
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

/* ===== Reveal-on-scroll ===== */
(function () {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

  els.forEach(el => io.observe(el));
})();

/* ===== Count-up stats (About page) ===== */
(function () {
  const stats = document.querySelectorAll('.stat .num[data-count]');
  if (!stats.length || !('IntersectionObserver' in window)) return;

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const dur = 1100;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  stats.forEach(el => io.observe(el));
})();

/* ===== Custom accordion (Why Insurance panel) ===== */
(function () {
  const items = document.querySelectorAll('.acc-item');
  if (!items.length) return;

  items.forEach((item, idx) => {
    const trigger = item.querySelector('.acc-trigger');
    const panel = item.querySelector('.acc-panel');
    if (!trigger || !panel) return;

    const openItem = () => {
      item.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    };
    const closeItem = () => {
      item.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      panel.style.maxHeight = '0px';
    };

    if (idx === 0) openItem(); else closeItem();

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(other => {
        const p = other.querySelector('.acc-panel');
        if (other !== item && p) {
          other.classList.remove('open');
          other.querySelector('.acc-trigger')?.setAttribute('aria-expanded', 'false');
          p.style.maxHeight = '0px';
        }
      });
      isOpen ? closeItem() : openItem();
    });
  });

  // Recalculate open panel height on resize (fonts/layout can shift height)
  window.addEventListener('resize', () => {
    document.querySelectorAll('.acc-item.open .acc-panel').forEach(p => {
      p.style.maxHeight = p.scrollHeight + 'px';
    });
  });
})();

/* ===== Formspree submit ===== */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xwpnjvvl";
(function () {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('form-status');
    const btn = form.querySelector('button[type="submit"]');
    const originalLabel = btn ? btn.innerHTML : '';

    if (status) {
      status.className = "notice";
      status.textContent = "Submitting...";
      status.classList.remove('hidden');
    }
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Submitting...';
    }

    const data = new FormData(form);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      });

      if (res.ok) {
        window.location.href = '../thank-you.html';
        return;
      } else {
        let msg = "Something went wrong. Please try again or call us.";
        try {
          const j = await res.json();
          if (j?.errors?.length) msg = j.errors.map(e => e.message).join(' ');
        } catch {}
        if (status) {
          status.className = "notice alert";
          status.textContent = msg;
        }
      }
    } catch {
      if (status) {
        status.className = "notice alert";
        status.textContent = "Network error. Please try again or call us.";
      }
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = originalLabel; }
    }
  });
})();

/* ===== Resources loader (resources page only) ===== */
(function () {
  const list = document.getElementById('pdfList');
  if (!list) return;
  if (list.querySelector('.resource-item') || list.querySelector('a')) return;
  list.innerHTML = '<div class="muted">No resources yet. Check back soon.</div>';
})();

/* ===== Mobile burger nav — clean, reliable ===== */
(function () {
  const drawer = document.getElementById('mobileNav');
  const toggle = document.querySelector('.nav-toggle');
  if (!drawer || !toggle) return;

  const panel = drawer.querySelector('.mobile-nav-panel');
  const closeBtn = drawer.querySelector('.nav-close');
  const backdrop = drawer.querySelector('.mobile-nav-backdrop');

  if (panel) {
    const existingCTA = panel.querySelector('.mobile-cta');
    if (existingCTA) existingCTA.remove();
    const depthPrefix = document.body.dataset.depth === '1' ? '../' : '';
    const cta = document.createElement('div');
    cta.className = 'mobile-cta';
    cta.innerHTML = `
      <a class="button" href="${depthPrefix}get-a-quote/">Get a Quote</a>
      <a class="button secondary" href="tel:+12155155975">Call Now</a>
    `;
    panel.appendChild(cta);
  }

  const open = () => {
    if (!drawer.hidden) return;
    drawer.hidden = false;
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
  };
  const close = (focusToggle = true) => {
    if (drawer.hidden) return;
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.hidden = true;
    if (focusToggle) try { toggle.focus(); } catch {}
  };

  toggle.replaceWith(toggle.cloneNode(true));
  const freshToggle = document.querySelector('.nav-toggle');
  const handlePress = (e) => {
    if (!e.currentTarget) return;
    e.preventDefault();
    e.stopPropagation();
    const expanded = freshToggle.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  };
  ['click', 'touchend'].forEach(ev => {
    freshToggle.addEventListener(ev, handlePress, { passive: false });
  });

  closeBtn?.addEventListener('click', () => close());
  backdrop?.addEventListener('click', () => close());
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  panel?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close(false)));
  panel?.querySelectorAll('.mobile-cta a').forEach(a => a.addEventListener('click', () => close(false)));
})();

/* ===== Pages without a splash still get their reveal animations kicked off ===== */
if (!document.getElementById('splash')) {
  document.body.classList.add('page-ready');
}


/* ===== Language switcher — English / Russian / Ukrainian ===== */
(function () {
  const translations = {
    ru: {
      "Home":"Главная","About":"О нас","Get a Quote":"Получить расчёт","Forms & Resources":"Формы и материалы",
      "Coverage that fits your life.":"Страховая защита, которая подходит именно вам.",
      "LivMarkins Insurance helps families and businesses protect what matters—without the jargon.":"LivMarkins Insurance помогает семьям и бизнесу защищать самое важное — просто и понятно.",
      "About Us":"О нас","Why Insurance?":"Зачем нужна страховка?",
      "You can’t control everything, but insurance lets you sleep at night knowing you’re covered when things go sideways.":"Не всё в жизни можно предусмотреть, но страховка даёт уверенность, что вы защищены, если что-то пойдёт не по плану.",
      "Health":"Медицинское страхование","Life":"Страхование жизни","Home & Auto":"Дом и авто","Trucking":"Грузоперевозки","Business Insurance":"Страхование бизнеса",
      "Plans for individuals, families, and small businesses.":"Планы для частных лиц, семей и малого бизнеса.",
      "Protect your family or partners with income replacement, debt coverage, and legacy planning.":"Защитите семью или деловых партнёров: компенсация утраченного дохода, покрытие долговых обязательств и планирование наследства.",
      "Personalized coverage for your home, auto, jewelry, and liability.":"Индивидуальная страховая защита для дома, автомобиля, ювелирных изделий и гражданской ответственности.",
      "We work with over a dozen carriers to get the best coverage to protect your rig, cargo, and liability exposures.":"Мы сотрудничаем более чем с десятком страховых компаний, чтобы подобрать оптимальную защиту для вашего грузовика, груза и ответственности.",
      "We are here to support all of your business endeavors. From 1 employee to a 50 employee company we will work with you to meet your needs.":"Мы помогаем защитить ваш бизнес на любом этапе — от компании с одним сотрудником до команды из 50 человек. Подберём покрытие под ваши потребности.",
      "Who We Work With":"Наши страховые партнёры","Lines We Cover":"Виды страхования","Company":"Компания","Call Now":"Позвонить"
    },
    uk: {
      "Home":"Головна","About":"Про нас","Get a Quote":"Отримати розрахунок","Forms & Resources":"Форми та матеріали",
      "Coverage that fits your life.":"Страховий захист, що відповідає вашому життю.",
      "LivMarkins Insurance helps families and businesses protect what matters—without the jargon.":"LivMarkins Insurance допомагає сім’ям і бізнесу захищати найважливіше — просто й зрозуміло.",
      "About Us":"Про нас","Why Insurance?":"Навіщо потрібне страхування?",
      "You can’t control everything, but insurance lets you sleep at night knowing you’re covered when things go sideways.":"Не все в житті можна передбачити, але страхування дає впевненість, що ви захищені, якщо щось піде не за планом.",
      "Health":"Медичне страхування","Life":"Страхування життя","Home & Auto":"Дім та авто","Trucking":"Вантажні перевезення","Business Insurance":"Страхування бізнесу",
      "Plans for individuals, families, and small businesses.":"Плани для окремих осіб, сімей і малого бізнесу.",
      "Protect your family or partners with income replacement, debt coverage, and legacy planning.":"Захистіть сім’ю або ділових партнерів: компенсація втраченого доходу, покриття боргових зобов’язань і планування спадщини.",
      "Personalized coverage for your home, auto, jewelry, and liability.":"Індивідуальний страховий захист для дому, автомобіля, ювелірних виробів і цивільної відповідальності.",
      "We work with over a dozen carriers to get the best coverage to protect your rig, cargo, and liability exposures.":"Ми співпрацюємо більш ніж із десятком страхових компаній, щоб підібрати оптимальний захист для вашої вантажівки, вантажу та відповідальності.",
      "We are here to support all of your business endeavors. From 1 employee to a 50 employee company we will work with you to meet your needs.":"Ми допомагаємо захистити ваш бізнес на будь-якому етапі — від компанії з одним працівником до команди з 50 осіб. Підберемо покриття відповідно до ваших потреб.",
      "Who We Work With":"Наші страхові партнери","Lines We Cover":"Види страхування","Company":"Компанія","Call Now":"Зателефонувати"
    }
  };
  const original = new WeakMap();
  const translatable = () => document.querySelectorAll('h1,h2,p,strong,li,a,button,.badge,.acc-panel-inner');
  function setLanguage(lang) {
    const dict = translations[lang] || {};
    translatable().forEach(el => {
      if (el.children.length && !el.classList.contains('acc-trigger')) return;
      const text = el.textContent.trim();
      if (!original.has(el)) original.set(el, text);
      const source = original.get(el);
      if (el.classList.contains('acc-trigger')) {
        const label = Array.from(el.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
        if (label) label.textContent = ' ' + (lang === 'en' ? source : (dict[source] || source)) + ' ';
      } else if (lang === 'en') el.textContent = source;
      else if (dict[source]) el.textContent = dict[source];
    });
    document.documentElement.lang = lang === 'uk' ? 'uk' : lang;
    localStorage.setItem('livmarkins-lang', lang);
    document.querySelectorAll('.lang-switch button').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  }
  function makeSwitcher() {
    const wrap=document.createElement('div');
    wrap.className='lang-switch';
    wrap.setAttribute('aria-label','Language');
    wrap.innerHTML='<button type="button" data-lang="en">EN</button><span>·</span><button type="button" data-lang="ru">РУС</button><span>·</span><button type="button" data-lang="uk">УКР</button>';
    wrap.addEventListener('click', e => { const b=e.target.closest('button[data-lang]'); if(b) setLanguage(b.dataset.lang); });
    return wrap;
  }
  document.querySelector('.nav-desktop')?.after(makeSwitcher());
  const mobilePanel=document.querySelector('.mobile-nav-panel');
  if(mobilePanel) mobilePanel.insertBefore(makeSwitcher(), mobilePanel.querySelector('.mobile-cta') || null);
  setLanguage(localStorage.getItem('livmarkins-lang') || 'en');
})();
