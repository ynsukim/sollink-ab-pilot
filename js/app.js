(function () {
  const EVENT_LIST = [
    {
      id: 'sollink',
      title: 'SOL LINK 신규 고객 이벤트',
      subtitle: '테슬라·100만원 혜택',
      period: '2026.01.01 ~ 2026.12.31',
      badge: 'NEW',
      featured: true,
    },
    {
      id: 'promo-fee',
      title: '온라인 수수료 우대 이벤트',
      subtitle: 'SUPERSOL 이용 고객',
      period: '2026.03.01 ~ 2026.06.30',
    },
    {
      id: 'slite',
      title: '나라사랑 S-Lite 개설 혜택',
      subtitle: '신규·기존 고객',
      period: '2026.04.01 ~ 2026.09.30',
    },
    {
      id: 'deposit',
      title: 'SUPERSOL 첫 입금 이벤트',
      subtitle: '최대 5만원 쿠폰',
      period: '2026.02.01 ~ 2026.08.31',
    },
    {
      id: 'friend',
      title: '친구 초대 리워드',
      subtitle: '추천인·피추천인 혜택',
      period: '상시',
    },
  ];

  let tracker = null;
  let currentView = 'list';

  const SECTIONS = {
    A: [
      { id: 'topBanner', img: 'assets/a/topBanner.png', alt: 'Top banner' },
      {
        id: 'productDesc',
        imgHeader: 'assets/a/productDesc-header.png',
        imgBody: 'assets/a/productDesc-body.png',
        ctas: [{ id: 'cta-open-account', label: 'SOL LINK 개설하기' }],
        bg: 'light',
      },
      {
        id: 'benefit1',
        imgTitle: 'assets/a/benefit-title.png',
        imgCard01: 'assets/a/benefit-card01.png',
        imgCard02: 'assets/a/benefit-card02.png',
        imgInfo: 'assets/a/benefit-info.png',
        ctas: [
          { id: 'cta-tesla-apply', label: '투자쿠폰 받고 테슬라 응모하기', primary: true },
          { id: 'cta-tesla-result', label: '테슬라 당첨 결과 보기', secondary: true },
        ],
        bg: 'dark',
      },
      {
        id: 'benefit2',
        imgHeader: 'assets/a/benefit2-header.png',
        imgCard: 'assets/a/benefit2-card.png',
        ctas: [{ id: 'cta-million', label: '최대 100만원 도전하기' }],
        bg: 'navy',
      },
      {
        id: 'commission',
        imgHeader: 'assets/a/commission-header.png',
        imgBody: 'assets/a/commission-body.png',
        ctas: [{ id: 'cta-fee-benefit', label: '수수료 혜택 신청하기' }],
        bg: 'green',
      },
      { id: 'contentContainer', img: 'assets/a/contentContainer.png', alt: 'Content' },
      { id: 'disclaimer', img: 'assets/a/disclaimer.png', alt: '알아두세요' },
    ],
    B: [
      { id: 'topBanner', img: 'assets/b/topBanner.png', alt: 'Top banner' },
      {
        id: 'productDesc',
        type: 'card',
        imgHeader: 'assets/b/productDesc-header.png',
        imgBody: 'assets/b/productDesc-body.png',
        ctas: [{ id: 'cta-learn-more', label: 'SOL LINK 자세히 보기' }],
        footnotes: [
          '슈퍼SOL 이용 및 마케팅 동의 고객',
          '만 19세 이상 개인 및 내국인',
          "'26.06.16(포함) 이후 개설한 나라사랑 S-Lite 보유고객 포함",
        ],
        badgeImage: 'assets/b/cta-bubble.png',
        bg: 'blue-card',
      },
      {
        id: 'benefit1',
        imgTitle: 'assets/b/benefit-title.png',
        imgCard01: 'assets/b/benefit-card01.png',
        imgCard02: 'assets/b/benefit-card02.png',
        imgInfo: 'assets/b/benefit-info.png',
        ctas: [
          { id: 'cta-tesla-apply', label: '투자쿠폰 받고 테슬라 응모하기', primary: true },
          { id: 'cta-tesla-result', label: '테슬라 당첨 결과 보기', secondary: true },
        ],
        bg: 'dark',
      },
      {
        id: 'benefit2',
        imgHeader: 'assets/b/benefit2-header.png',
        imgCard: 'assets/b/benefit2-card.png',
        ctas: [{ id: 'cta-million', label: '최대 100만원 도전하기' }],
        bg: 'navy',
      },
      {
        id: 'commission',
        imgHeader: 'assets/b/commission-header.png',
        imgBody: 'assets/b/commission-body.png',
        ctas: [{ id: 'cta-fee-benefit', label: '수수료 혜택 신청하기' }],
        bg: 'green',
      },
      { id: 'contentContainer', img: 'assets/b/contentContainer.png', alt: 'Content' },
      { id: 'disclaimer', img: 'assets/b/disclaimer.png', alt: '알아두세요' },
    ],
  };

  function img(src, alt) {
    return `<img src="${src}" alt="${alt || ''}" loading="lazy" decoding="async">`;
  }

  function renderCtas(ctas, tracker) {
    if (!ctas?.length) return '';
    return `<div class="cta-group">${ctas
      .map(
        (cta) =>
          `<button type="button" class="cta-btn ${cta.secondary ? 'secondary' : 'primary'}" data-cta-id="${cta.id}" data-cta-label="${cta.label}">${cta.label}</button>`
      )
      .join('')}</div>`;
  }

  function renderSection(section) {
    if (section.img) {
      return `<section class="section section-image" data-section="${section.id}">${img(section.img, section.alt)}</section>`;
    }

    if (section.type === 'card') {
      const footnotes = section.footnotes
        ? `<ul class="footnotes">${section.footnotes.map((f) => `<li>${f}</li>`).join('')}</ul>`
        : '';
      return `
        <section class="section section-product-card ${section.bg}" data-section="${section.id}">
          <div class="product-card">
            <div class="section-stack section-stack--gap-md">
              ${img(section.imgHeader, 'Product header')}
              ${img(section.imgBody, 'Product body')}
            </div>
            <div class="cta-block">
              ${section.badgeImage ? `<div class="cta-bubble-wrap"><img src="${section.badgeImage}" alt="" class="cta-bubble"></div>` : ''}
              ${renderCtas(section.ctas)}
            </div>
          </div>
          ${footnotes}
        </section>`;
    }

    if (section.imgTitle) {
      return `
        <section class="section section-benefit ${section.bg}" data-section="${section.id}">
          <div class="section-stack section-stack--gap-xl">
            ${img(section.imgTitle, 'Benefit title')}
            <div class="section-stack section-stack--gap-md section-stack--inset">
              ${img(section.imgCard01, 'Card 1')}
              ${img(section.imgCard02, 'Card 2')}
            </div>
            <div class="section-stack section-stack--gap-xl section-stack--inset">
              ${renderCtas(section.ctas)}
              ${section.imgInfo ? img(section.imgInfo, 'Info') : ''}
            </div>
          </div>
        </section>`;
    }

    if (section.imgCard && !section.imgBody) {
      return `
        <section class="section section-benefit2 ${section.bg}" data-section="${section.id}">
          <div class="section-stack section-stack--gap-xl section-stack--inset">
            ${img(section.imgHeader, 'Header')}
            ${img(section.imgCard, 'Card')}
            ${renderCtas(section.ctas)}
          </div>
        </section>`;
    }

    return `
      <section class="section section-product ${section.bg}" data-section="${section.id}">
        <div class="section-stack section-stack--gap-lg section-stack--inset">
          ${img(section.imgHeader, 'Header')}
          ${img(section.imgBody, 'Body')}
        </div>
        ${renderCtas(section.ctas)}
      </section>`;
  }

  function bindCtas(main, tracker) {
    main.querySelectorAll('[data-cta-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        tracker.trackCta(btn.dataset.ctaId, btn.dataset.ctaLabel);
        btn.classList.add('clicked');
        setTimeout(() => btn.classList.remove('clicked'), 300);
      });
    });
  }

  let productCardShakeObserver = null;
  let productCardBubbleObserver = null;
  let productCardBubbleAppearObserver = null;
  let productCardScrollHandler = null;

  function teardownProductCardAnimations() {
    productCardShakeObserver?.disconnect();
    productCardShakeObserver = null;
    productCardBubbleObserver?.disconnect();
    productCardBubbleObserver = null;
    productCardBubbleAppearObserver?.disconnect();
    productCardBubbleAppearObserver = null;

    if (productCardScrollHandler) {
      window.removeEventListener('scroll', productCardScrollHandler);
      productCardScrollHandler = null;
    }
  }

  function renderEventList() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <section class="event-list-screen" aria-label="이벤트 목록">
        <div class="event-list-header">
          <h2 class="event-list-heading">진행 중인 이벤트</h2>
          <p class="event-list-subheading">관심 있는 이벤트를 선택하세요</p>
        </div>
        <ul class="event-list">
          ${EVENT_LIST.map(
            (event) => `
            <li>
              <button type="button" class="event-list-item${event.featured ? ' featured' : ''}" data-open-event="${event.id}">
                ${event.badge ? `<span class="event-list-badge">${event.badge}</span>` : ''}
                <span class="event-list-title">${event.title}</span>
                <span class="event-list-desc">${event.subtitle}</span>
                <span class="event-list-period">${event.period}</span>
              </button>
            </li>`
          ).join('')}
        </ul>
      </section>`;

    main.querySelectorAll('[data-open-event]').forEach((btn) => {
      btn.addEventListener('click', openEventDetail);
    });
  }

  function updateHeader(view) {
    const backBtn = document.getElementById('back-btn');
    const backIcon = backBtn?.querySelector('.top-nav-back-icon');
    const title = backBtn?.querySelector('.top-nav-title');

    if (!backBtn) return;

    if (view === 'list') {
      title.textContent = '이벤트';
      backIcon?.classList.add('hidden');
      backBtn.setAttribute('aria-hidden', 'true');
      backBtn.tabIndex = -1;
    } else {
      title.textContent = '이벤트';
      backIcon?.classList.remove('hidden');
      backBtn.removeAttribute('aria-hidden');
      backBtn.tabIndex = 0;
    }
  }

  function showList() {
    currentView = 'list';
    document.body.dataset.view = 'list';
    delete document.body.dataset.variant;
    teardownProductCardAnimations();
    updateHeader('list');
    renderEventList();
  }

  function leaveDetail(source = 'browser_back') {
    if (tracker) {
      tracker.markBackPressed(source);
      tracker.flush(true);
      tracker = null;
    }
    teardownProductCardAnimations();
    showList();
  }

  function enterDetail() {
    currentView = 'detail';
    document.body.dataset.view = 'detail';
    updateHeader('detail');

    tracker = new window.SollinkAnalytics.SessionTracker();
    document.body.dataset.variant = tracker.variant;
    renderMain(tracker.variant, tracker);
    tracker.init();
    window.scrollTo(0, 0);
  }

  function openEventDetail() {
    if (currentView === 'detail') return;
    history.pushState({ view: 'detail' }, '');
    enterDetail();
  }

  function setupNavigation() {
    history.replaceState({ view: 'list' }, '');

    window.addEventListener('popstate', (event) => {
      const view = event.state?.view || 'list';
      if (view === 'list' && currentView === 'detail') {
        const source = sessionStorage.getItem('sollink_back_source') || 'browser_back';
        sessionStorage.removeItem('sollink_back_source');
        leaveDetail(source);
        return;
      }

      if (view === 'detail' && currentView === 'list') {
        enterDetail();
      }
    });

    document.getElementById('back-btn')?.addEventListener('click', () => {
      if (currentView !== 'detail') return;
      sessionStorage.setItem('sollink_back_source', 'header_button');
      history.back();
    });
  }

  function setupProductCardShake(variant) {
    productCardShakeObserver?.disconnect();
    productCardShakeObserver = null;
    productCardBubbleObserver?.disconnect();
    productCardBubbleObserver = null;
    productCardBubbleAppearObserver?.disconnect();
    productCardBubbleAppearObserver = null;

    if (productCardScrollHandler) {
      window.removeEventListener('scroll', productCardScrollHandler);
      productCardScrollHandler = null;
    }

    if (variant !== 'B') return;

    const card = document.querySelector('[data-section="productDesc"] .product-card');
    if (!card) return;

    const bubble = card.querySelector('.cta-bubble-wrap');
    let cardAboveThreshold = false;
    let bubbleInCenter = false;
    let bubbleWasInView = false;
    let lastScrollY = window.scrollY;
    let scrollingDown = true;

    productCardScrollHandler = () => {
      scrollingDown = window.scrollY >= lastScrollY;
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', productCardScrollHandler, { passive: true });

    const runBubbleAppear = () => {
      if (!bubble) return;

      bubble.classList.remove('appear-attention');
      void bubble.offsetWidth;
      bubble.classList.add('appear-attention');
    };

    const runBubbleBounce = () => {
      if (!bubble) return;

      bubble.classList.remove('bounce-attention');
      void bubble.offsetWidth;
      bubble.classList.add('bounce-attention');
      bubble.addEventListener(
        'animationend',
        () => bubble.classList.remove('bounce-attention'),
        { once: true }
      );
    };

    const runShake = () => {
      card.classList.remove('shake-attention');
      void card.offsetWidth;
      card.classList.add('shake-attention');
      card.addEventListener(
        'animationend',
        () => card.classList.remove('shake-attention'),
        { once: true }
      );
    };

    productCardShakeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== card) return;

          const nowAbove = entry.isIntersecting && entry.intersectionRatio >= 0.6;

          if (nowAbove && !cardAboveThreshold && scrollingDown) {
            runShake();
          }

          cardAboveThreshold = nowAbove;
        });
      },
      { threshold: [0, 0.25, 0.45, 0.6, 0.75, 1] }
    );

    productCardShakeObserver.observe(card);

    if (!bubble) return;

    productCardBubbleAppearObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== bubble) return;

          const inView = entry.isIntersecting && entry.intersectionRatio >= 0.15;

          if (inView && !bubbleWasInView) {
            runBubbleAppear();
          }

          if (!entry.isIntersecting) {
            bubble.classList.remove('appear-attention');
          }

          bubbleWasInView = inView;
        });
      },
      { threshold: [0, 0.15, 0.3, 0.5] }
    );

    productCardBubbleAppearObserver.observe(bubble);

    productCardBubbleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== bubble) return;

          const inCenter = entry.isIntersecting;

          if (inCenter && !bubbleInCenter) {
            runBubbleBounce();
          }

          bubbleInCenter = inCenter;
        });
      },
      {
        threshold: 0,
        rootMargin: '-40% 0px -40% 0px',
      }
    );

    productCardBubbleObserver.observe(bubble);
  }

  function renderMain(variant, tracker) {
    const main = document.getElementById('main-content');
    main.innerHTML = SECTIONS[variant].map(renderSection).join('');
    bindCtas(main, tracker);
    tracker.resetSections();
    setupProductCardShake(variant);
  }

  function switchVariant() {
    if (!tracker) return;
    const other = tracker.variant === 'A' ? 'B' : 'A';
    tracker.trackEvent('variant_switch', { from: tracker.variant, to: other });
    window.SollinkAnalytics.setVariant(other);

    const url = new URL(window.location.href);
    url.searchParams.set('variant', other);
    history.replaceState({ view: 'detail' }, '', url);

    tracker.variant = other;
    document.body.dataset.variant = other;
    renderMain(other, tracker);
    window.scrollTo(0, 0);
  }

  function setupHeaderActions() {
    document.getElementById('btn-version-info')?.addEventListener('click', () => {
      if (!tracker) return;
      alert(`현재 버전: Type ${tracker.variant}`);
    });

    document.getElementById('btn-switch-version')?.addEventListener('click', () => {
      switchVariant();
    });
  }

  function init() {
    showList();
    setupNavigation();
    setupHeaderActions();

    const url = new URL(window.location.href);
    if (url.searchParams.get('variant') === 'A' || url.searchParams.get('variant') === 'B') {
      history.pushState({ view: 'detail' }, '');
      enterDetail();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
