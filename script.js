/* =========================================
   LivMarkins — script.js
   ========================================= */

/* ===== Splash (home only, safe no-op elsewhere) ===== */
(function () {
  const splash = document.getElementById('splash');
  const vid = document.getElementById('splashVideo');
  if (!splash || !vid) return;

  const finish = () => { if (!splash.classList.contains('hide')) splash.classList.add('hide'); };
  vid.addEventListener('ended', finish);
  splash.addEventListener('click', finish);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') finish(); });

  const tryPlay = () => { if (vid.paused) { vid.play().catch(()=>{}); } window.removeEventListener('pointerdown', tryPlay, { passive:true }); };
  window.addEventListener('pointerdown', tryPlay, { passive:true });

  let safetyTimer = setTimeout(finish, 12000);
  const setDurationTimer = () => {
    clearTimeout(safetyTimer);
    const dur = (isFinite(vid.duration) && vid.duration > 0) ? vid.duration : 6;
    const ms = Math.min((dur * 1000) + 800, 12000);
    safetyTimer = setTimeout(finish, ms);
  };
  if (isFinite(vid.duration) && vid.duration > 0) setDurationTimer();
  else vid.addEventListener('loadedmetadata', setDurationTimer, { once:true });

  vid.addEventListener('error', () => setTimeout(finish, 1200), { once:true });
})();

/* ===== Formspree submit ===== */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xwpnjvvl"; // ✅ real endpoint
(function () {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  // Keep the existing form, with trucking selected for campaign visitors.
  const requestedType = new URLSearchParams(window.location.search).get('type');
  const insuranceType = form.querySelector('[name="insurance_type"]');
  if (insuranceType && requestedType && Array.from(insuranceType.options).some(option => option.value === requestedType)) {
    insuranceType.value = requestedType;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const status = document.getElementById('form-status');
    if (status) {
      status.className = "notice";
      status.textContent = "Submitting...";
      status.classList.remove('hidden');
    }

    const data = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      });

      if (res.ok) {
        // ✅ Redirect to thank you page on success
        window.location.href = '/thank-you.html';
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
    }
  });
})();

/* ===== Resources loader (resources.html only) =====
   FIXED: Do NOT overwrite your hard-coded resources.
   Your CMS Marketplace Form is in resources.html already,
   so this script now "hands off" if it sees any items.
*/
(function () {
  const list = document.getElementById('pdfList');
  if (!list) return;

  // ✅ If you already have hard-coded resources, leave them alone.
  if (list.querySelector('.resource-item') || list.querySelector('a')) return;

  // Optional: if the list is truly empty, show a default message.
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

  // Inject bottom CTAs exactly once
  if (panel) {
    const existingCTA = panel.querySelector('.mobile-cta');
    if (existingCTA) existingCTA.remove();
    const cta = document.createElement('div');
    cta.className = 'mobile-cta';
    cta.innerHTML = `
      <a class="button" href="/get-a-quote/">Get a Quote</a>
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


  const handlePress = (e) => {
    if (!e.currentTarget) return;
    e.preventDefault();
    e.stopPropagation();
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  };

  toggle.addEventListener('click', handlePress);

  closeBtn?.addEventListener('click', () => close());
  backdrop?.addEventListener('click', () => close());
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  panel?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => close(false));
  });

  panel?.querySelectorAll('.mobile-cta a').forEach(a => {
    a.addEventListener('click', () => close(false));
  });
})();


/* ===== Full-site language switcher: EN / RU / UK ===== */
(function(){
const T={ru:{"You can’t control everything, but insurance lets you sleep at night knowing you’re covered when things go sideways.":"Не всё в жизни можно предусмотреть, но страховка даёт спокойствие и уверенность, что вы защищены, если что-то пойдёт не по плану.","Plans for individuals, families, and small businesses.":"Планы для частных лиц, семей и малого бизнеса.","Protect your family or partners with income replacement, debt coverage, and legacy planning.":"Защитите семью или деловых партнёров: компенсация утраченного дохода, покрытие долговых обязательств и планирование наследства.","Personalized coverage for your home, auto, jewelry, and liability.":"Индивидуальная защита для дома, автомобиля, ювелирных изделий и гражданской ответственности.","We work with over a dozen carriers to get the best coverage to protect your rig, cargo, and liability exposures.":"Мы сотрудничаем более чем с десятком страховых компаний, чтобы подобрать оптимальную защиту для вашего грузовика, груза и ответственности.","Explore trucking insurance →":"Подробнее о страховании грузоперевозок →","We are here to support all of your business endeavors. From 1 employee to a 50 employee company we will work with you to meet your needs.":"Мы помогаем защитить бизнес на любом этапе — от компании с одним сотрудником до команды из 50 человек. Подберём страховую защиту под ваши потребности.","LivMarkins • Trucking Insurance":"LivMarkins • Страхование грузоперевозок","So do we.":"Мы тоже.","We’re part of the logistics business. Our agents are people passionate about this industry, on and off the clock. So we know how important the minor details are.":"Мы хорошо знаем логистику изнутри. Наши специалисты действительно увлечены этой отраслью, поэтому понимают, насколько важна каждая деталь.","Get a Trucking Quote":"Получить расчёт","Rooted in logistics":"Знаем логистику изнутри","One agent.":"Один агент.","Every mile.":"На всём пути.","Personal guidance throughout the growth of your trucking business.":"Персональная поддержка на каждом этапе развития вашего транспортного бизнеса.","Industry experience":"Опыт в отрасли","Personal service":"Персональный сервис","Highway certified & compliant insurance":"Страхование с учётом требований отрасли","Insurance support grounded in the needs of the trucking industry.":"Страховая поддержка с пониманием реальных потребностей транспортного бизнеса.","One agent as your business grows":"Один агент по мере роста вашего бизнеса","A consistent point of contact who gets to know your operation.":"Постоянный специалист, который знает особенности вашего бизнеса.","Claims staff who understand trucking":"Специалисты по убыткам, которые понимают грузоперевозки","Knowledgeable people who understand your business when you need help.":"Опытные специалисты, которые понимают ваш бизнес и готовы помочь в нужный момент.","A department for your COI needs":"Отдельная поддержка по страховым сертификатам","Dedicated support for your certificates of insurance.":"Специализированная помощь с сертификатами страхования (COI).","A portal for instant COIs":"Портал для быстрого получения COI","Access certificates of insurance through an online portal.":"Получайте сертификаты страхования через онлайн-портал.","Trucking for hire":"Коммерческие грузоперевозки","Different loads. Different routes. Guidance that understands your operation.":"Разные грузы. Разные маршруты. Рекомендации с пониманием специфики вашего бизнеса.","Dry van":"Сухой фургон","Flatbed":"Открытая платформа","Oversized & heavy equipment haulers":"Перевозка негабаритных грузов и тяжёлой техники","Bulk hopper":"Перевозка сыпучих грузов","Refrigerated":"Рефрижераторные перевозки","Auto haulers":"Автовозы","Tankers":"Автоцистерны","Hazmat":"Опасные грузы","Commercial auto liability":"Ответственность коммерческого автотранспорта","Physical damage insurance":"Страхование физического ущерба","Motor truck cargo insurance":"Страхование перевозимого груза","Non-trucking liability insurance":"Ответственность при использовании грузовика вне работы","General liability insurance":"Общая гражданская ответственность","Cyber liability insurance":"Киберответственность","Tell us about your operation. We’ll help you explore your coverage options.":"Расскажите нам о вашем бизнесе, и мы поможем подобрать подходящие варианты страховой защиты.","Thank You!":"Спасибо!","We’ve received your request and will be in touch within one business day.":"Мы получили вашу заявку и свяжемся с вами в течение одного рабочего дня.","Return to Home":"Вернуться на главную",
"Coverage that fits your life.":"Страховая защита, которая подходит именно вам.","LivMarkins Insurance helps families and businesses protect what matters—without the jargon.":"LivMarkins Insurance помогает семьям и бизнесу защищать самое важное — просто и понятно.","Why Insurance?":"Зачем нужна страховка?","Who We Work With":"Наши страховые партнёры","For the road ahead":"Для дороги впереди","Your trucking business. Our industry experience.":"Ваш бизнес в грузоперевозках. Наш отраслевой опыт.","Personal guidance, coverage for your operation, and support for your certificate of insurance needs.":"Персональная помощь, страховая защита вашего бизнеса и поддержка по вопросам страховых сертификатов.","Explore Trucking Insurance →":"Подробнее о страховании грузоперевозок →",
"You’ve got commercial truck experience. So do we.":"Вы знаете грузоперевозки. Мы тоже.","You take pride in your business. We take pride in our trucking insurance experience.":"Вы гордитесь своим бизнесом. Мы — своим опытом в страховании грузоперевозок.","More than a policy":"Больше, чем просто полис","What we offer the trucking industry":"Что мы предлагаем транспортному бизнесу","Who we work with":"С кем мы работаем","Coverage for the road ahead":"Защита для каждого километра пути","Products for your trucking business":"Страховые решения для вашего транспортного бизнеса","Let’s talk trucking":"Поговорим о грузоперевозках","Your next mile starts with a conversation.":"Следующий километр начинается с разговора.","Get a Trucking Quote →":"Получить расчёт для грузоперевозок →","Call 215-515-5975":"Позвонить: 215-515-5975",
"Home":"Главная","About":"О нас","Trucking":"Грузоперевозки","Get a Quote":"Получить расчёт","Forms & Resources":"Формы и материалы","About Us":"О нас",
"About Us":"О нас","Our Promise":"Наше обещание","Personal guidance and support when you need it.":"Персональная помощь и поддержка именно тогда, когда она вам нужна.",
"Built on Relationships":"В основе — доверительные отношения",
"We’re not a 1-800 number, we’re a family-owned and operated insurance agency built on real relationships and real care. With over 15 years of experience in the insurance industry, we’ve seen firsthand how confusing and impersonal insurance can feel. That’s exactly why we do things differently.":"Мы не безликая служба по номеру 1-800. LivMarkins — семейное страховое агентство, где всё строится на личном отношении, доверии и настоящей заботе. За более чем 15 лет работы в страховании мы не раз видели, насколько сложным и безличным может казаться этот процесс. Именно поэтому мы работаем по-другому.",
"We take the time to listen, educate, and guide our clients so they can make confident decisions about protecting what matters most. Whether it’s your home, vehicles, business, or livelihood, you’re never just a policy number to us. You’re family.":"Мы внимательно выслушиваем каждого клиента, объясняем всё понятным языком и помогаем выбрать подходящую защиту, чтобы вы могли уверенно принимать решения о том, что для вас действительно важно. Дом, автомобили, бизнес или источник дохода — для нас вы никогда не будете просто номером полиса. Мы относимся к вам как к семье.",
"Our focus is simple. Honest advice, dependable coverage, and being there when you actually need us. When questions come up or life throws a curveball, you’ll always speak to someone who knows you and truly cares.":"Наш подход прост: честные рекомендации, надёжная страховая защита и поддержка тогда, когда она действительно нужна. Если возникнут вопросы или жизнь преподнесёт неожиданность, вы всегда сможете поговорить с человеком, который знает вашу ситуацию и искренне хочет помочь.",
"At LivMarkins Insurance, personal connection matters. We believe the best service starts with trust, honesty, and taking the time to truly understand each client’s needs.":"В LivMarkins Insurance мы ценим личное общение. Для нас хороший сервис начинается с доверия, честности и желания по-настоящему понять потребности каждого клиента.",
"Our goal is to make insurance feel less overwhelming and more personal, so every client feels supported, informed, and confident in their coverage.":"Наша цель — сделать страхование понятнее и человечнее, чтобы каждый клиент чувствовал поддержку, был хорошо информирован и уверен в своей страховой защите.",
"Get a Quote":"Получить расчёт","Best way to contact - Phone, email, text. Complete this form and we’ll follow up within one business day.":"Укажите удобный способ связи — телефон, электронную почту или SMS. Заполните форму, и мы свяжемся с вами в течение одного рабочего дня.",
"Full Name *":"Имя и фамилия *","Phone *":"Телефон *","Email *":"Электронная почта *","Insurance Type *":"Вид страхования *","Select one":"Выберите вариант","Health":"Медицинское страхование","Life":"Страхование жизни","Home":"Дом","Auto":"Авто","Business Insurance":"Страхование бизнеса","Notes":"Дополнительная информация","Submit":"Отправить","Prefer phone? Call":"Предпочитаете позвонить? Звоните",
"Here you can access important forms and downloads.":"Здесь вы найдёте необходимые формы и материалы для скачивания.","Available Downloads":"Доступные документы","CMS Marketplace Form":"Форма CMS Marketplace","Before we can begin to assist you with your health insurance needs please fill, sign, and return to us.":"Чтобы мы могли помочь вам с медицинским страхованием, пожалуйста, заполните и подпишите эту форму, а затем отправьте её нам.","Download PDF":"Скачать PDF",
"Follow Us":"Мы в соцсетях","Lines We Cover":"Виды страхования","Company":"Компания","Home & Auto":"Дом и авто","Phone: 215-515-5975":"Телефон: 215-515-5975","Call Now":"Позвонить"
},uk:{"You can’t control everything, but insurance lets you sleep at night knowing you’re covered when things go sideways.":"Не все в житті можна передбачити, але страхування дає спокій і впевненість, що ви захищені, якщо щось піде не за планом.","Plans for individuals, families, and small businesses.":"Плани для окремих осіб, сімей і малого бізнесу.","Protect your family or partners with income replacement, debt coverage, and legacy planning.":"Захистіть родину або ділових партнерів: компенсація втраченого доходу, покриття боргових зобов’язань і планування спадщини.","Personalized coverage for your home, auto, jewelry, and liability.":"Індивідуальний захист для дому, автомобіля, ювелірних виробів і цивільної відповідальності.","We work with over a dozen carriers to get the best coverage to protect your rig, cargo, and liability exposures.":"Ми співпрацюємо більш ніж із десятком страхових компаній, щоб підібрати оптимальний захист для вашої вантажівки, вантажу та відповідальності.","Explore trucking insurance →":"Докладніше про страхування вантажних перевезень →","We are here to support all of your business endeavors. From 1 employee to a 50 employee company we will work with you to meet your needs.":"Ми допомагаємо захистити бізнес на будь-якому етапі — від компанії з одним працівником до команди з 50 осіб. Підберемо страховий захист відповідно до ваших потреб.","LivMarkins • Trucking Insurance":"LivMarkins • Страхування вантажних перевезень","So do we.":"Ми також.","We’re part of the logistics business. Our agents are people passionate about this industry, on and off the clock. So we know how important the minor details are.":"Ми добре знаємо логістику зсередини. Наші фахівці справді захоплені цією галуззю, тому розуміють, наскільки важлива кожна деталь.","Get a Trucking Quote":"Отримати розрахунок","Rooted in logistics":"Знаємо логістику зсередини","One agent.":"Один агент.","Every mile.":"На всьому шляху.","Personal guidance throughout the growth of your trucking business.":"Персональна підтримка на кожному етапі розвитку вашого транспортного бізнесу.","Industry experience":"Досвід у галузі","Personal service":"Персональний сервіс","Highway certified & compliant insurance":"Страхування з урахуванням вимог галузі","Insurance support grounded in the needs of the trucking industry.":"Страхова підтримка з розумінням реальних потреб транспортного бізнесу.","One agent as your business grows":"Один агент у міру розвитку вашого бізнесу","A consistent point of contact who gets to know your operation.":"Постійний фахівець, який знає особливості вашого бізнесу.","Claims staff who understand trucking":"Фахівці з урегулювання, які розуміють вантажні перевезення","Knowledgeable people who understand your business when you need help.":"Досвідчені фахівці, які розуміють ваш бізнес і готові допомогти в потрібний момент.","A department for your COI needs":"Окрема підтримка щодо страхових сертифікатів","Dedicated support for your certificates of insurance.":"Спеціалізована допомога із сертифікатами страхування (COI).","A portal for instant COIs":"Портал для швидкого отримання COI","Access certificates of insurance through an online portal.":"Отримуйте сертифікати страхування через онлайн-портал.","Trucking for hire":"Комерційні вантажні перевезення","Different loads. Different routes. Guidance that understands your operation.":"Різні вантажі. Різні маршрути. Рекомендації з розумінням специфіки вашого бізнесу.","Dry van":"Сухий фургон","Flatbed":"Відкрита платформа","Oversized & heavy equipment haulers":"Перевезення негабаритних вантажів і важкої техніки","Bulk hopper":"Перевезення сипучих вантажів","Refrigerated":"Рефрижераторні перевезення","Auto haulers":"Автовози","Tankers":"Автоцистерни","Hazmat":"Небезпечні вантажі","Commercial auto liability":"Відповідальність комерційного автотранспорту","Physical damage insurance":"Страхування фізичних пошкоджень","Motor truck cargo insurance":"Страхування вантажу","Non-trucking liability insurance":"Відповідальність під час використання вантажівки поза роботою","General liability insurance":"Загальна цивільна відповідальність","Cyber liability insurance":"Кібервідповідальність","Tell us about your operation. We’ll help you explore your coverage options.":"Розкажіть нам про ваш бізнес, і ми допоможемо підібрати відповідні варіанти страхового захисту.","Thank You!":"Дякуємо!","We’ve received your request and will be in touch within one business day.":"Ми отримали вашу заявку та зв’яжемося з вами протягом одного робочого дня.","Return to Home":"Повернутися на головну",
"Coverage that fits your life.":"Страховий захист, що відповідає вашому життю.","LivMarkins Insurance helps families and businesses protect what matters—without the jargon.":"LivMarkins Insurance допомагає сім’ям і бізнесу захищати найважливіше — просто й зрозуміло.","Why Insurance?":"Навіщо потрібне страхування?","Who We Work With":"Наші страхові партнери","For the road ahead":"Для дороги попереду","Your trucking business. Our industry experience.":"Ваш бізнес у вантажних перевезеннях. Наш галузевий досвід.","Personal guidance, coverage for your operation, and support for your certificate of insurance needs.":"Персональна допомога, страховий захист вашого бізнесу та підтримка з питань страхових сертифікатів.","Explore Trucking Insurance →":"Докладніше про страхування вантажних перевезень →",
"You’ve got commercial truck experience. So do we.":"Ви знаєте вантажні перевезення. Ми також.","You take pride in your business. We take pride in our trucking insurance experience.":"Ви пишаєтеся своїм бізнесом. Ми — своїм досвідом у страхуванні вантажних перевезень.","More than a policy":"Більше, ніж просто поліс","What we offer the trucking industry":"Що ми пропонуємо транспортному бізнесу","Who we work with":"З ким ми працюємо","Coverage for the road ahead":"Захист на кожному кілометрі шляху","Products for your trucking business":"Страхові рішення для вашого транспортного бізнесу","Let’s talk trucking":"Поговорімо про вантажні перевезення","Your next mile starts with a conversation.":"Наступний кілометр починається з розмови.","Get a Trucking Quote →":"Отримати розрахунок для вантажних перевезень →","Call 215-515-5975":"Зателефонувати: 215-515-5975",
"Home":"Головна","About":"Про нас","Trucking":"Вантажні перевезення","Get a Quote":"Отримати розрахунок","Forms & Resources":"Форми та матеріали","About Us":"Про нас",
"Our Promise":"Наша обіцянка","Personal guidance and support when you need it.":"Персональна допомога та підтримка саме тоді, коли вона вам потрібна.","Built on Relationships":"В основі — довірливі стосунки",
"We’re not a 1-800 number, we’re a family-owned and operated insurance agency built on real relationships and real care. With over 15 years of experience in the insurance industry, we’ve seen firsthand how confusing and impersonal insurance can feel. That’s exactly why we do things differently.":"Ми не безликий сервіс за номером 1-800. LivMarkins — сімейна страхова агенція, де все будується на особистому ставленні, довірі та щирій турботі. За понад 15 років роботи у страхуванні ми не раз бачили, наскільки складним і безособовим може здаватися цей процес. Саме тому ми працюємо інакше.",
"We take the time to listen, educate, and guide our clients so they can make confident decisions about protecting what matters most. Whether it’s your home, vehicles, business, or livelihood, you’re never just a policy number to us. You’re family.":"Ми уважно слухаємо кожного клієнта, пояснюємо все зрозумілою мовою та допомагаємо обрати належний захист, щоб ви могли впевнено приймати рішення щодо найважливішого. Дім, автомобілі, бізнес чи джерело доходу — для нас ви ніколи не будете просто номером поліса. Ми ставимося до вас як до родини.",
"Our focus is simple. Honest advice, dependable coverage, and being there when you actually need us. When questions come up or life throws a curveball, you’ll always speak to someone who knows you and truly cares.":"Наш підхід простий: чесні поради, надійний страховий захист і підтримка тоді, коли вона справді потрібна. Якщо виникнуть запитання або життя піднесе несподіванку, ви завжди зможете поговорити з людиною, яка знає вашу ситуацію та щиро прагне допомогти.",
"At LivMarkins Insurance, personal connection matters. We believe the best service starts with trust, honesty, and taking the time to truly understand each client’s needs.":"У LivMarkins Insurance ми цінуємо особисте спілкування. Для нас якісний сервіс починається з довіри, чесності та бажання по-справжньому зрозуміти потреби кожного клієнта.",
"Our goal is to make insurance feel less overwhelming and more personal, so every client feels supported, informed, and confident in their coverage.":"Наша мета — зробити страхування зрозумілішим і людянішим, щоб кожен клієнт відчував підтримку, був добре поінформований і впевнений у своєму страховому захисті.",
"Best way to contact - Phone, email, text. Complete this form and we’ll follow up within one business day.":"Вкажіть зручний спосіб зв’язку — телефон, електронну пошту або SMS. Заповніть форму, і ми зв’яжемося з вами протягом одного робочого дня.",
"Full Name *":"Ім’я та прізвище *","Phone *":"Телефон *","Email *":"Електронна пошта *","Insurance Type *":"Вид страхування *","Select one":"Оберіть варіант","Health":"Медичне страхування","Life":"Страхування життя","Home":"Дім","Auto":"Авто","Business Insurance":"Страхування бізнесу","Notes":"Додаткова інформація","Submit":"Надіслати","Prefer phone? Call":"Зручніше телефоном? Телефонуйте",
"Here you can access important forms and downloads.":"Тут ви знайдете необхідні форми та матеріали для завантаження.","Available Downloads":"Доступні документи","CMS Marketplace Form":"Форма CMS Marketplace","Before we can begin to assist you with your health insurance needs please fill, sign, and return to us.":"Щоб ми могли допомогти вам із медичним страхуванням, будь ласка, заповніть і підпишіть цю форму, а потім надішліть її нам.","Download PDF":"Завантажити PDF",
"Follow Us":"Ми в соцмережах","Lines We Cover":"Види страхування","Company":"Компанія","Home & Auto":"Дім та авто","Phone: 215-515-5975":"Телефон: 215-515-5975","Call Now":"Зателефонувати"
}};
const originals=new WeakMap();
const norm=s=>s.replace(/\s+/g,' ').trim();
function apply(lang){
 document.querySelectorAll('h1,h2,h3,p,strong,li,a,button,label,option,summary,.badge,.trucking-eyebrow,.trucking-call,small').forEach(el=>{
  if(el.children.length && !['A','BUTTON'].includes(el.tagName)) return;
  if(!originals.has(el)) originals.set(el,el.textContent);
  const source=originals.get(el), key=norm(source);
  if(lang==='en') el.textContent=source; else if(T[lang]?.[key]) el.textContent=T[lang][key];
 });
 document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{
   if(!el.dataset.enPlaceholder) el.dataset.enPlaceholder=el.placeholder;
   const p=el.dataset.enPlaceholder;
   if(lang==='en') el.placeholder=p;
   else if(p.startsWith('Tell us')) el.placeholder=lang==='ru'?'Расскажите немного о ваших потребностях (водители, имущество, бизнес и т. д.)':'Розкажіть трохи про ваші потреби (водії, майно, бізнес тощо)';
 });
 document.documentElement.lang=lang; localStorage.setItem('livmarkins-lang',lang);
 document.querySelectorAll('.lang-switch button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
}
function switcher(){
 const d=document.createElement('div');d.className='lang-switch';d.innerHTML='<button type="button" data-lang="en">EN</button><span>·</span><button type="button" data-lang="ru">РУС</button><span>·</span><button type="button" data-lang="uk">УКР</button>';
 d.addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(b)apply(b.dataset.lang)});return d;
}
const desktopNav=document.querySelector('.nav-desktop');if(desktopNav){const ul=desktopNav.querySelector('ul');const li=document.createElement('li');li.className='lang-menu-item';li.appendChild(switcher());ul?.appendChild(li);}
const panel=document.querySelector('.mobile-nav-panel');if(panel){const ul=panel.querySelector('ul');const li=document.createElement('li');li.className='lang-menu-item';li.appendChild(switcher());ul?.appendChild(li);}
apply(localStorage.getItem('livmarkins-lang')||'en');
})();
