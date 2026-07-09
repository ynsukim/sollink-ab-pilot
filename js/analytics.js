(function () {
  const STORAGE_KEY = 'sollink_ab_variant';
  const QUEUE_KEY = 'sollink_ab_event_queue';
  const ARCHIVES_KEY = 'sollink_ab_archives';

  function uuid() {
    return crypto.randomUUID();
  }

  function getConfig() {
    return window.SOLLINK_CONFIG || {};
  }

  function getVariant() {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get('variant');
    if (forced === 'A' || forced === 'B') {
      sessionStorage.setItem(STORAGE_KEY, forced);
      return forced;
    }

    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing === 'A' || existing === 'B') return existing;

    const variant = Math.random() < 0.5 ? 'A' : 'B';
    sessionStorage.setItem(STORAGE_KEY, variant);
    return variant;
  }

  function getArchivesLocal() {
    return JSON.parse(localStorage.getItem(ARCHIVES_KEY) || '[]');
  }

  function saveArchivesLocal(archives) {
    localStorage.setItem(ARCHIVES_KEY, JSON.stringify(archives));
  }

  function hasSupabaseConfig() {
    const { supabaseUrl, supabaseAnonKey } = getConfig();
    return Boolean(supabaseUrl && supabaseAnonKey);
  }

  async function fetchArchivesRemote() {
    const { supabaseUrl, supabaseAnonKey } = getConfig();
    const res = await fetch(
      `${supabaseUrl}/rest/v1/session_archives?select=*&order=archived_at.desc`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    );
    if (!res.ok) throw new Error('Failed to fetch archives');
    return res.json();
  }

  async function archiveAndResetRemote(label) {
    const { supabaseUrl, supabaseAnonKey } = getConfig();
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/archive_and_reset_sessions`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archive_label: label || null }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Archive and reset failed');
    }
    return res.json();
  }

  function archiveAndResetLocal(label) {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    const archives = getArchivesLocal();
    let archivedCount = 0;

    if (queue.length) {
      archives.unshift({
        id: `local-${Date.now()}`,
        archived_at: new Date().toISOString(),
        label: label || `Archive ${new Date().toLocaleString()}`,
        session_count: queue.length,
        sessions: queue,
      });
      archivedCount = queue.length;
      saveArchivesLocal(archives);
    }

    localStorage.removeItem(QUEUE_KEY);
    return { archived_count: archivedCount, label, archived_at: new Date().toISOString() };
  }

  async function flushQueueImpl() {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (!queue.length) return 0;

    let sent = 0;
    for (const payload of queue) {
      const result = await sendToSupabase(payload);
      if (result.ok) sent += 1;
    }
    if (sent === queue.length) localStorage.removeItem(QUEUE_KEY);
    return sent;
  }

  async function archiveAndReset(label) {
    if (hasSupabaseConfig()) {
      await flushQueueImpl();
      const result = await archiveAndResetRemote(label);
      localStorage.removeItem(QUEUE_KEY);
      return result;
    }
    return archiveAndResetLocal(label);
  }

  function queueEvent(payload) {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push(payload);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  async function sendToSupabase(payload) {
    const { supabaseUrl, supabaseAnonKey } = getConfig();
    if (!supabaseUrl || !supabaseAnonKey) {
      queueEvent(payload);
      return { ok: false, reason: 'no_config' };
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/sessions`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      queueEvent(payload);
      return { ok: false, reason: 'request_failed' };
    }
    return { ok: true };
  }

  class SessionTracker {
    constructor() {
      this.sessionId = uuid();
      this.variant = getVariant();
      this.startedAt = Date.now();
      this.sectionDwell = {};
      this.sectionEnterTimes = {};
      this.ctaClicks = [];
      this.backPressed = false;
      this.backPressedAt = null;
      this.maxScrollDepth = 0;
      this.active = true;
      this.flushTimer = null;
    }

    init() {
      this.setupSectionObserver();
      this.setupScrollTracking();
      this.setupVisibilityFlush();

      window.addEventListener('pagehide', () => this.flush(true));
      window.addEventListener('beforeunload', () => this.flush(true));
    }

    markBackPressed(source = 'header_button') {
      if (this.backPressed) return;
      this.backPressed = true;
      this.backPressedAt = new Date().toISOString();
      this.trackEvent('back_press', { at: this.backPressedAt, source });
    }

    setupSectionObserver() {
      const sections = document.querySelectorAll('[data-section]');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const id = entry.target.dataset.section;
            if (entry.isIntersecting) {
              this.sectionEnterTimes[id] = Date.now();
            } else if (this.sectionEnterTimes[id]) {
              const elapsed = Date.now() - this.sectionEnterTimes[id];
              this.sectionDwell[id] = (this.sectionDwell[id] || 0) + elapsed;
              delete this.sectionEnterTimes[id];
            }
          });
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      );

      sections.forEach((section) => observer.observe(section));
      this.observer = observer;
    }

    setupScrollTracking() {
      const updateDepth = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        const depth = Math.min(1, scrollTop / docHeight);
        this.maxScrollDepth = Math.max(this.maxScrollDepth, depth);
      };

      window.addEventListener('scroll', updateDepth, { passive: true });
      updateDepth();
    }

    setupVisibilityFlush() {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') this.flush(true);
      });
    }

    trackCta(id, label) {
      const click = { id, label, at: new Date().toISOString() };
      this.ctaClicks.push(click);
      this.trackEvent('cta_click', click);
    }

    trackEvent(type, data) {
      const event = {
        session_id: this.sessionId,
        variant: this.variant,
        event_type: type,
        event_data: data,
        created_at: new Date().toISOString(),
      };

      const { supabaseUrl, supabaseAnonKey } = getConfig();
      if (supabaseUrl && supabaseAnonKey) {
        fetch(`${supabaseUrl}/rest/v1/events`, {
          method: 'POST',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(event),
          keepalive: true,
        }).catch(() => {});
      }
    }

    finalizeDwell() {
      Object.keys(this.sectionEnterTimes).forEach((id) => {
        const elapsed = Date.now() - this.sectionEnterTimes[id];
        this.sectionDwell[id] = (this.sectionDwell[id] || 0) + elapsed;
      });
      this.sectionEnterTimes = {};
    }

    buildPayload() {
      this.finalizeDwell();
      const endedAt = Date.now();

      return {
        session_id: this.sessionId,
        variant: this.variant,
        started_at: new Date(this.startedAt).toISOString(),
        ended_at: new Date(endedAt).toISOString(),
        total_time_ms: endedAt - this.startedAt,
        section_dwell: this.sectionDwell,
        max_scroll_depth: Math.round(this.maxScrollDepth * 1000) / 1000,
        cta_clicks: this.ctaClicks,
        back_pressed: this.backPressed,
        back_pressed_at: this.backPressedAt,
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      };
    }

    resetSections() {
      if (this.observer) this.observer.disconnect();
      this.sectionEnterTimes = {};
      this.setupSectionObserver();
      this.maxScrollDepth = 0;
    }

    async flush(useBeacon) {
      if (!this.active) return;
      this.active = false;

      const payload = this.buildPayload();
      const body = JSON.stringify(payload);

      const { supabaseUrl, supabaseAnonKey } = getConfig();
      if (supabaseUrl && supabaseAnonKey && useBeacon) {
        fetch(`${supabaseUrl}/rest/v1/sessions`, {
          method: 'POST',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body,
          keepalive: true,
        }).catch(() => queueEvent(payload));
      } else {
        await sendToSupabase(payload);
      }
    }
  }

  function setVariant(variant) {
    sessionStorage.setItem(STORAGE_KEY, variant);
  }

  window.SollinkAnalytics = {
    SessionTracker,
    getVariant,
    setVariant,
    hasSupabaseConfig,
    getArchivesLocal,
    fetchArchivesRemote,
    archiveAndReset,
    getQueuedSessions() {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    },
    clearQueue() {
      localStorage.removeItem(QUEUE_KEY);
    },
    async flushQueue() {
      return flushQueueImpl();
    },
  };
})();
