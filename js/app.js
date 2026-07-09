(function () {
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

  function switchVariant(tracker) {
    const other = tracker.variant === 'A' ? 'B' : 'A';
    tracker.trackEvent('variant_switch', { from: tracker.variant, to: other });
    window.SollinkAnalytics.setVariant(other);

    const url = new URL(window.location.href);
    url.searchParams.set('variant', other);
    history.replaceState({}, '', url);

    tracker.variant = other;
    document.body.dataset.variant = other;
    renderMain(other, tracker);
    window.scrollTo(0, 0);
  }

  function setupHeaderActions(tracker) {
    document.getElementById('btn-version-info')?.addEventListener('click', () => {
      alert(`현재 버전: Type ${tracker.variant}`);
    });

    document.getElementById('btn-switch-version')?.addEventListener('click', () => {
      switchVariant(tracker);
    });
  }

  function init() {
    const tracker = new window.SollinkAnalytics.SessionTracker();
    const variant = tracker.variant;

    document.body.dataset.variant = variant;
    renderMain(variant, tracker);
    setupHeaderActions(tracker);
    tracker.init();

    const endBtn = document.getElementById('end-session');
    if (endBtn) {
      endBtn.addEventListener('click', async () => {
        await tracker.flush(false);
        alert('Session saved. You can close this page.');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
