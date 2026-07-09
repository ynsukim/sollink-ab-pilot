(function () {
  let sessions = [];

  async function fetchSessions() {
    const { supabaseUrl, supabaseAnonKey } = window.SOLLINK_CONFIG || {};
    const localQueue = window.SollinkAnalytics.getQueuedSessions();

    if (!supabaseUrl || !supabaseAnonKey) {
      return localQueue.map((s, i) => ({ ...s, _source: 'local', _id: `local-${i}` }));
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/sessions?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    );

    if (!res.ok) throw new Error('Failed to fetch sessions');
    const remote = await res.json();
    return [...remote.map((s) => ({ ...s, _source: 'remote' })), ...localQueue.map((s, i) => ({ ...s, _source: 'local', _id: `local-${i}` }))];
  }

  function formatDwell(sectionDwell) {
    if (!sectionDwell) return '-';
    const entries = typeof sectionDwell === 'string' ? JSON.parse(sectionDwell) : sectionDwell;
    return Object.entries(entries)
      .map(([k, v]) => `${k}: ${Math.round(v / 1000)}s`)
      .join(', ');
  }

  function formatCtas(clicks) {
    const list = typeof clicks === 'string' ? JSON.parse(clicks) : clicks;
    if (!list?.length) return '-';
    return list.map((c) => c.label || c.id).join(', ');
  }

  function filterData(data) {
    const variant = document.getElementById('variant-filter').value;
    if (!variant) return data;
    return data.filter((s) => s.variant === variant);
  }

  function renderStats(data) {
    const filtered = filterData(data);
    const total = filtered.length;
    const aCount = filtered.filter((s) => s.variant === 'A').length;
    const bCount = filtered.filter((s) => s.variant === 'B').length;
    const avgTime = total ? Math.round(filtered.reduce((sum, s) => sum + (s.total_time_ms || 0), 0) / total / 1000) : 0;
    const backCount = filtered.filter((s) => s.back_pressed).length;
    const ctaCount = filtered.reduce((sum, s) => {
      const clicks = typeof s.cta_clicks === 'string' ? JSON.parse(s.cta_clicks) : s.cta_clicks;
      return sum + (clicks?.length || 0);
    }, 0);

    document.getElementById('stats').innerHTML = `
      <div class="stat"><span>Sessions</span><strong>${total}</strong></div>
      <div class="stat"><span>Type A</span><strong>${aCount}</strong></div>
      <div class="stat"><span>Type B</span><strong>${bCount}</strong></div>
      <div class="stat"><span>Avg time</span><strong>${avgTime}s</strong></div>
      <div class="stat"><span>Back pressed</span><strong>${backCount}</strong></div>
      <div class="stat"><span>CTA clicks</span><strong>${ctaCount}</strong></div>
    `;
  }

  function renderDwellChart(data) {
    const filtered = filterData(data);
    const totals = {};
    const counts = {};

    filtered.forEach((s) => {
      const dwell = typeof s.section_dwell === 'string' ? JSON.parse(s.section_dwell) : s.section_dwell;
      if (!dwell) return;
      Object.entries(dwell).forEach(([section, ms]) => {
        totals[section] = (totals[section] || 0) + ms;
        counts[section] = (counts[section] || 0) + 1;
      });
    });

    const rows = Object.keys(totals)
      .map((section) => ({
        section,
        avg: Math.round(totals[section] / counts[section] / 1000),
      }))
      .sort((a, b) => b.avg - a.avg);

    document.getElementById('dwell-chart').innerHTML = rows.length
      ? `<table><thead><tr><th>Section</th><th>Avg dwell (s)</th></tr></thead><tbody>${rows
          .map((r) => `<tr><td>${r.section}</td><td>${r.avg}</td></tr>`)
          .join('')}</tbody></table>`
      : '<p>No dwell data yet.</p>';
  }

  function renderTable(data) {
    const filtered = filterData(data);
    document.getElementById('sessions-body').innerHTML = filtered
      .map((s) => {
        const started = s.started_at || s.created_at || '-';
        const scroll = s.max_scroll_depth != null ? `${Math.round(s.max_scroll_depth * 100)}%` : '-';
        return `<tr>
          <td>${started.slice(0, 19).replace('T', ' ')}</td>
          <td>${s.variant}</td>
          <td>${Math.round((s.total_time_ms || 0) / 1000)}</td>
          <td>${scroll}</td>
          <td>${s.back_pressed ? 'Yes' : 'No'}</td>
          <td>${formatCtas(s.cta_clicks)}</td>
          <td><pre>${formatDwell(s.section_dwell)}</pre></td>
        </tr>`;
      })
      .join('');
  }

  async function loadData() {
    try {
      sessions = await fetchSessions();
    } catch (err) {
      sessions = window.SollinkAnalytics.getQueuedSessions();
    }
    renderStats(sessions);
    renderTable(sessions);
    renderDwellChart(sessions);
  }

  document.getElementById('refresh-btn').addEventListener('click', loadData);
  document.getElementById('variant-filter').addEventListener('change', () => {
    renderStats(sessions);
    renderTable(sessions);
    renderDwellChart(sessions);
  });

  document.getElementById('flush-queue-btn').addEventListener('click', async () => {
    const sent = await window.SollinkAnalytics.flushQueue();
    alert(`Uploaded ${sent} queued session(s).`);
    loadData();
  });

  document.getElementById('export-csv-btn').addEventListener('click', () => {
    const filtered = filterData(sessions);
    const headers = ['started_at', 'variant', 'total_time_ms', 'max_scroll_depth', 'back_pressed', 'cta_clicks', 'section_dwell'];
    const rows = filtered.map((s) =>
      headers.map((h) => JSON.stringify(s[h] ?? '')).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sollink-ab-${Date.now()}.csv`;
    a.click();
  });

  loadData();
})();
