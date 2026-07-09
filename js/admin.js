(function () {
  let sessions = [];

  const SECTION_LABELS = {
    topBanner: 'Top banner',
    productDesc: 'Product description',
    benefit1: 'Benefit — Tesla promo',
    benefit2: 'Benefit — 1M challenge',
    commission: 'Commission / fees',
    contentContainer: 'Content block',
    disclaimer: 'Disclaimer',
  };

  const CTA_ROWS = [
    { id: 'cta-open-account', label: 'SOL LINK 개설하기', variant: 'A' },
    { id: 'cta-learn-more', label: 'SOL LINK 자세히 보기', variant: 'B' },
    { id: 'cta-tesla-apply', label: '투자쿠폰 받고 테슬라 응모하기' },
    { id: 'cta-tesla-result', label: '테슬라 당첨 결과 보기' },
    { id: 'cta-million', label: '최대 100만원 도전하기' },
    { id: 'cta-fee-benefit', label: '수수료 혜택 신청하기' },
  ];

  const SECTION_ORDER = [
    'topBanner',
    'productDesc',
    'benefit1',
    'benefit2',
    'commission',
    'contentContainer',
    'disclaimer',
  ];

  function parseField(val, fallback) {
    if (val == null) return fallback;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    }
    return val;
  }

  async function fetchSessions() {
    const { supabaseUrl, supabaseAnonKey } = window.SOLLINK_CONFIG || {};
    const localQueue = window.SollinkAnalytics.getQueuedSessions();

    if (!supabaseUrl || !supabaseAnonKey) {
      return localQueue.map((s, i) => ({ ...s, _source: 'local', _id: `local-${i}` }));
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/sessions?select=*&order=created_at.desc`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch sessions');
    const remote = await res.json();
    return [
      ...remote.map((s) => ({ ...s, _source: 'remote' })),
      ...localQueue.map((s, i) => ({ ...s, _source: 'local', _id: `local-${i}` })),
    ];
  }

  function byVariant(data) {
    return {
      A: data.filter((s) => s.variant === 'A'),
      B: data.filter((s) => s.variant === 'B'),
    };
  }

  function avgSeconds(list, getMs) {
    if (!list.length) return null;
    const total = list.reduce((sum, s) => sum + getMs(s), 0);
    return total / list.length / 1000;
  }

  function ctrPercent(list, ctaId) {
    if (!list.length) return null;
    const clicked = list.filter((s) => {
      const clicks = parseField(s.cta_clicks, []);
      if (!ctaId) return clicks.length > 0;
      return clicks.some((c) => c.id === ctaId);
    }).length;
    return (clicked / list.length) * 100;
  }

  function avgSectionDwell(list, sectionId) {
    const samples = list
      .map((s) => parseField(s.section_dwell, {})[sectionId] || 0)
      .filter((ms) => ms > 0);
    if (!samples.length) return null;
    return samples.reduce((a, b) => a + b, 0) / samples.length / 1000;
  }

  function formatNum(value, decimals = 1) {
    if (value == null || Number.isNaN(value)) return '—';
    return value.toFixed(decimals);
  }

  function formatPct(value) {
    if (value == null || Number.isNaN(value)) return '—';
    return `${value.toFixed(1)}%`;
  }

  function formatDelta(aVal, bVal, { unit = '', isPercent = false, higherIsBetter = true } = {}) {
    if (aVal == null || bVal == null) {
      return { text: '—', className: 'delta-neutral' };
    }

    const diff = bVal - aVal;
    if (Math.abs(diff) < 0.05) {
      return { text: '≈ same', className: 'delta-neutral' };
    }

    const rel = aVal !== 0 ? (diff / aVal) * 100 : null;
    const sign = diff > 0 ? '+' : '';
    const absText = isPercent
      ? `${sign}${diff.toFixed(1)} pp`
      : `${sign}${diff.toFixed(1)}${unit}${rel != null ? ` (${sign}${rel.toFixed(0)}%)` : ''}`;

    let className = 'delta-neutral';
    if (higherIsBetter) className = diff > 0 ? 'delta-good' : 'delta-bad';
    else className = diff < 0 ? 'delta-good' : 'delta-bad';

    return { text: absText, className };
  }

  function bestClass(aVal, bVal, higherIsBetter = true) {
    if (aVal == null || bVal == null || aVal === bVal) return ['', ''];
    const bWins = higherIsBetter ? bVal > aVal : bVal < aVal;
    return bWins ? ['', 'winner'] : ['winner', ''];
  }

  function row(label, hint, aVal, bVal, format, options = {}) {
    const { isPercent = false, higherIsBetter = true } = options;
    const aText = isPercent ? formatPct(aVal) : formatNum(aVal);
    const bText = isPercent ? formatPct(bVal) : formatNum(bVal);
    const delta = formatDelta(aVal, bVal, { unit: isPercent ? '' : 's', isPercent, higherIsBetter });
    const [aClass, bClass] = bestClass(aVal, bVal, higherIsBetter);

    return `<tr>
      <td class="metric-label">${label}${hint ? `<span class="metric-hint">${hint}</span>` : ''}</td>
      <td class="${aClass}">${aText}</td>
      <td class="${bClass}">${bText}</td>
      <td class="${delta.className}">${delta.text}</td>
    </tr>`;
  }

  function sectionHead(title) {
    return `<tr class="section-head"><td colspan="4">${title}</td></tr>`;
  }

  function renderSummary({ A, B }) {
    document.getElementById('summary-pills').innerHTML = `
      <div class="pill">Type A sessions<strong>${A.length}</strong></div>
      <div class="pill">Type B sessions<strong>${B.length}</strong></div>
      <div class="pill">Total<strong>${A.length + B.length}</strong></div>
    `;
    document.getElementById('session-count').textContent = String(A.length + B.length);
  }

  function renderComparison(data) {
    const { A, B } = byVariant(data);
    renderSummary({ A, B });

    if (!A.length && !B.length) {
      document.getElementById('comparison-table').innerHTML =
        '<p class="empty-state">No session data yet. Use the prototype, then end a session or close the tab.</p>';
      return;
    }

    const overallCtrA = ctrPercent(A);
    const overallCtrB = ctrPercent(B);
    const avgTimeA = avgSeconds(A, (s) => s.total_time_ms || 0);
    const avgTimeB = avgSeconds(B, (s) => s.total_time_ms || 0);

    let html = `<table class="compare-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Type A</th>
          <th>Type B</th>
          <th>Difference (B − A)</th>
        </tr>
      </thead>
      <tbody>
        ${sectionHead('Overall')}
        ${row('Avg viewing duration', 'Total time on page', avgTimeA, avgTimeB, formatNum, { higherIsBetter: true })}
        ${row('Overall CTR', 'Sessions with any CTA click', overallCtrA, overallCtrB, formatPct, { isPercent: true, higherIsBetter: true })}
        ${sectionHead('Section viewing time (avg dwell)')}
    `;

    SECTION_ORDER.forEach((sectionId) => {
      html += row(
        SECTION_LABELS[sectionId] || sectionId,
        'Seconds spent in section',
        avgSectionDwell(A, sectionId),
        avgSectionDwell(B, sectionId),
        formatNum,
        { higherIsBetter: true }
      );
    });

    html += sectionHead('CTA click-through rate');
    CTA_ROWS.forEach((cta) => {
      const listA = cta.variant === 'B' ? [] : A;
      const listB = cta.variant === 'A' ? [] : B;
      const aCtr = cta.variant === 'B' ? null : ctrPercent(listA, cta.id);
      const bCtr = cta.variant === 'A' ? null : ctrPercent(listB, cta.id);
      html += row(
        cta.label,
        cta.variant ? `Type ${cta.variant} only` : 'Both variants',
        aCtr,
        bCtr,
        formatPct,
        { isPercent: true, higherIsBetter: true }
      );
    });

    html += '</tbody></table>';
    document.getElementById('comparison-table').innerHTML = html;
  }

  function renderRawLogs(data) {
    const sorted = [...data].sort(
      (a, b) => new Date(b.started_at || b.created_at || 0) - new Date(a.started_at || a.created_at || 0)
    );

    document.getElementById('sessions-body').innerHTML = sorted.length
      ? sorted
          .map((s) => {
            const started = (s.started_at || s.created_at || '-').slice(0, 19).replace('T', ' ');
            const clicks = parseField(s.cta_clicks, []);
            const clickLabels = clicks.length
              ? clicks.map((c) => c.label || c.id).join(', ')
              : '—';
            return `<tr>
              <td>${started}</td>
              <td>${s.variant || '?'}</td>
              <td>${Math.round((s.total_time_ms || 0) / 1000)}s</td>
              <td>${clickLabels}</td>
            </tr>`;
          })
          .join('')
      : '<tr><td colspan="4">No sessions recorded.</td></tr>';
  }

  async function loadData() {
    try {
      sessions = await fetchSessions();
    } catch {
      sessions = window.SollinkAnalytics.getQueuedSessions();
    }
    renderComparison(sessions);
    renderRawLogs(sessions);
  }

  document.getElementById('refresh-btn').addEventListener('click', loadData);

  document.getElementById('flush-queue-btn').addEventListener('click', async () => {
    const sent = await window.SollinkAnalytics.flushQueue();
    alert(`Uploaded ${sent} queued session(s).`);
    loadData();
  });

  document.getElementById('export-csv-btn').addEventListener('click', () => {
    const headers = [
      'started_at',
      'variant',
      'total_time_ms',
      'max_scroll_depth',
      'back_pressed',
      'cta_clicks',
      'section_dwell',
    ];
    const rows = sessions.map((s) => headers.map((h) => JSON.stringify(s[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sollink-ab-${Date.now()}.csv`;
    a.click();
  });

  loadData();
})();
