import "./styles/main.css";
import "./styles/insights.css";

import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient.js";

const SESSION_TABLE = "analytics_sessions";
const PAGE_VIEW_TABLE = "analytics_page_views";
const PAGE_SIZE = 1000;
const DEFAULT_RANGE = "30";

const appEl = document.getElementById("insights-app");
const supabase = getSupabaseClient();

const state = {
  session: null,
  loading: false,
  error: "",
  range: DEFAULT_RANGE,
  sessions: [],
  pageViews: [],
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatDuration = (seconds = 0) => {
  const totalSeconds = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = Math.floor(totalSeconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
};

const formatDateTime = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatDateLabel = (value) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const formatPathLabel = (path, title) => {
  if (path === "/") return "Home";
  if (title) {
    return title.replace(/\s+\|\s+Brandon Copeland$/, "").trim();
  }

  const basename = path.split("/").pop() || path;
  return basename.replace(".html", "").replaceAll("-", " ");
};

const getCutoffDate = () => {
  if (state.range === "all") return null;
  const days = Number.parseInt(state.range, 10);
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return cutoff;
};

const filterByRange = (rows, dateKey) => {
  const cutoff = getCutoffDate();
  if (!cutoff) return rows;
  return rows.filter((row) => new Date(row[dateKey]) >= cutoff);
};

const groupBy = (items, getKey) => {
  const groups = new Map();

  items.forEach((item) => {
    const key = getKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  return groups;
};

const getSessionDurationMap = (pageViews) => {
  const durations = new Map();

  pageViews.forEach((view) => {
    durations.set(
      view.session_id,
      (durations.get(view.session_id) || 0) + (Number(view.duration_seconds) || 0)
    );
  });

  return durations;
};

const getVisitorSessionCountMap = (sessions) => {
  const counts = new Map();

  sessions.forEach((session) => {
    counts.set(session.visitor_id, (counts.get(session.visitor_id) || 0) + 1);
  });

  return counts;
};

const createDailyVisitorSeries = (pageViews) => {
  const perDay = new Map();

  pageViews.forEach((view) => {
    const day = view.entered_at.slice(0, 10);
    if (!perDay.has(day)) {
      perDay.set(day, {
        visitors: new Set(),
        sessions: new Set(),
      });
    }

    perDay.get(day).visitors.add(view.visitor_id);
    perDay.get(day).sessions.add(view.session_id);
  });

  return Array.from(perDay.entries())
    .map(([day, values]) => ({
      day,
      visitors: values.visitors.size,
      sessions: values.sessions.size,
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
};

const buildPageStats = (pageViews) => {
  const grouped = groupBy(pageViews, (view) => view.path);

  return Array.from(grouped.entries())
    .map(([path, views]) => {
      const title = views[0]?.page_title || "";
      const uniqueVisitors = new Set(views.map((view) => view.visitor_id)).size;
      const avgDuration =
        views.reduce((total, view) => total + (Number(view.duration_seconds) || 0), 0) /
        Math.max(views.length, 1);
      const avgScroll =
        views.reduce((total, view) => total + (Number(view.max_scroll_pct) || 0), 0) /
        Math.max(views.length, 1);

      return {
        path,
        label: formatPathLabel(path, title),
        views: views.length,
        uniqueVisitors,
        avgDuration,
        avgScroll,
      };
    })
    .sort((a, b) => b.views - a.views);
};

const buildAreaStats = (pageViews) => {
  const areaMap = new Map();

  pageViews.forEach((view) => {
    const areaTimes = view.area_times || {};

    Object.entries(areaTimes).forEach(([area, seconds]) => {
      const key = `${view.path}::${area}`;
      const current = areaMap.get(key) || {
        path: view.path,
        pageLabel: formatPathLabel(view.path, view.page_title),
        area,
        seconds: 0,
      };

      current.seconds += Number(seconds) || 0;
      areaMap.set(key, current);
    });
  });

  return Array.from(areaMap.values()).sort((a, b) => b.seconds - a.seconds);
};

const buildRecentSessions = (sessions, pageViews) => {
  const viewsBySession = groupBy(pageViews, (view) => view.session_id);
  const visitorSessionCounts = getVisitorSessionCountMap(state.sessions);
  const sessionDurations = getSessionDurationMap(state.pageViews);

  return sessions
    .map((session) => {
      const views = (viewsBySession.get(session.id) || []).slice().sort((a, b) => {
        return new Date(a.entered_at) - new Date(b.entered_at);
      });

      const pageTrail = views.map((view) => formatPathLabel(view.path, view.page_title));
      const uniquePageTrail = pageTrail.filter((label, index) => {
        return index === 0 || label !== pageTrail[index - 1];
      });

      return {
        id: session.id,
        startedAt: session.started_at,
        referrer: session.referrer,
        visitorId: session.visitor_id,
        returning: (visitorSessionCounts.get(session.visitor_id) || 0) > 1,
        durationSeconds: sessionDurations.get(session.id) || 0,
        pages: uniquePageTrail,
      };
    })
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
};

const getMetrics = () => {
  const filteredSessions = filterByRange(state.sessions, "started_at");
  const filteredPageViews = filterByRange(state.pageViews, "entered_at");
  const sessionDurations = getSessionDurationMap(filteredPageViews);
  const filteredVisitors = new Set(filteredPageViews.map((view) => view.visitor_id));
  const visitorSessionCounts = getVisitorSessionCountMap(state.sessions);
  const returningVisitors = Array.from(filteredVisitors).filter((visitorId) => {
    return (visitorSessionCounts.get(visitorId) || 0) > 1;
  }).length;
  const totalDuration = Array.from(sessionDurations.values()).reduce((sum, value) => sum + value, 0);
  const avgSessionDuration = totalDuration / Math.max(sessionDurations.size, 1);

  return {
    filteredSessions,
    filteredPageViews,
    summary: {
      visitors: filteredVisitors.size,
      sessions: filteredSessions.length,
      pageViews: filteredPageViews.length,
      returningVisitors,
      avgSessionDuration,
    },
    dailySeries: createDailyVisitorSeries(filteredPageViews),
    pageStats: buildPageStats(filteredPageViews),
    areaStats: buildAreaStats(filteredPageViews),
    recentSessions: buildRecentSessions(filteredSessions, filteredPageViews).slice(0, 12),
  };
};

const renderDailySeries = (dailySeries) => {
  if (!dailySeries.length) {
    return '<p class="insights-empty">No visits yet for the selected range.</p>';
  }

  const maxVisitors = Math.max(...dailySeries.map((item) => item.visitors), 1);

  return `
    <div class="insights-bars">
      ${dailySeries
        .map((item) => {
          const width = Math.max(8, Math.round((item.visitors / maxVisitors) * 100));
          return `
            <div class="insights-bars__row">
              <div class="insights-bars__meta">
                <strong>${escapeHtml(formatDateLabel(item.day))}</strong>
                <span>${item.visitors} visitors</span>
              </div>
              <div class="insights-bars__track">
                <span class="insights-bars__fill" style="width: ${width}%"></span>
              </div>
              <span class="insights-bars__sessions">${item.sessions} sessions</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
};

const renderPageTable = (pageStats) => {
  if (!pageStats.length) {
    return '<p class="insights-empty">No page data yet.</p>';
  }

  return `
    <div class="insights-table-wrap">
      <table class="insights-table">
        <thead>
          <tr>
            <th>Page</th>
            <th>Views</th>
            <th>Visitors</th>
            <th>Avg time</th>
            <th>Avg scroll</th>
          </tr>
        </thead>
        <tbody>
          ${pageStats
            .map((page) => {
              return `
                <tr>
                  <td>
                    <strong>${escapeHtml(page.label)}</strong>
                    <span class="insights-table__subtle">${escapeHtml(page.path)}</span>
                  </td>
                  <td>${page.views}</td>
                  <td>${page.uniqueVisitors}</td>
                  <td>${escapeHtml(formatDuration(page.avgDuration))}</td>
                  <td>${Math.round(page.avgScroll)}%</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
};

const renderAreaTable = (areaStats) => {
  if (!areaStats.length) {
    return '<p class="insights-empty">Area attention will appear after a few visits.</p>';
  }

  return `
    <div class="insights-table-wrap">
      <table class="insights-table">
        <thead>
          <tr>
            <th>Page</th>
            <th>Area</th>
            <th>Total engaged time</th>
          </tr>
        </thead>
        <tbody>
          ${areaStats
            .slice(0, 15)
            .map((area) => {
              return `
                <tr>
                  <td>${escapeHtml(area.pageLabel)}</td>
                  <td>${escapeHtml(area.area)}</td>
                  <td>${escapeHtml(formatDuration(area.seconds))}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
};

const renderRecentSessions = (recentSessions) => {
  if (!recentSessions.length) {
    return '<p class="insights-empty">Returning visitors and page trails will show up here.</p>';
  }

  return `
    <div class="insights-session-list">
      ${recentSessions
        .map((session) => {
          const referrer = session.referrer ? new URL(session.referrer).hostname : "Direct";
          return `
            <article class="insights-session-card">
              <div class="insights-session-card__top">
                <div>
                  <strong>${escapeHtml(formatDateTime(session.startedAt))}</strong>
                  <p>${escapeHtml(formatDuration(session.durationSeconds))} across ${session.pages.length || 1} page${session.pages.length === 1 ? "" : "s"}</p>
                </div>
                <span class="insights-pill">${session.returning ? "Returned visitor" : "First seen visitor"}</span>
              </div>
              <p class="insights-session-card__trail">${escapeHtml(session.pages.join(" -> ") || "Single page visit")}</p>
              <p class="insights-session-card__meta">
                Referrer: ${escapeHtml(referrer)}<br />
                Visitor ID: <code>${escapeHtml(session.visitorId)}</code>
              </p>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
};

const renderShell = () => {
  if (!isSupabaseConfigured()) {
    appEl.innerHTML = `
      <section class="insights-shell">
        <div class="container">
          <div class="insights-auth-card">
            <h1>Private analytics dashboard</h1>
            <p>Add your Supabase URL and anon key to a local <code>.env</code> file, then rebuild the site.</p>
            <p>Use the SQL file in <code>supabase/analytics.sql</code> before visiting this page on production.</p>
          </div>
        </div>
      </section>
    `;
    return;
  }

  if (!state.session) {
    appEl.innerHTML = `
      <section class="insights-shell">
        <div class="container">
          <div class="insights-auth-card">
            <p class="insights-eyebrow">Hidden route</p>
            <h1>Private analytics dashboard</h1>
            <p>Sign in with your Supabase account to view visitor history, page flow, return visits, and section-level attention.</p>
            <form class="insights-auth-form" id="insights-sign-in-form">
              <label>
                Email
                <input type="email" name="email" autocomplete="email" required />
              </label>
              <label>
                Password
                <input type="password" name="password" autocomplete="current-password" required />
              </label>
              <button type="submit">Sign in</button>
            </form>
            ${state.error ? `<p class="insights-error">${escapeHtml(state.error)}</p>` : ""}
          </div>
        </div>
      </section>
    `;

    document.getElementById("insights-sign-in-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      state.error = "";
      renderShell();

      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") || "");
      const password = String(formData.get("password") || "");
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        state.error = error.message;
        renderShell();
      }
    });

    return;
  }

  const metrics = getMetrics();

  appEl.innerHTML = `
    <section class="insights-shell">
      <div class="container">
        <header class="insights-header">
          <div>
            <p class="insights-eyebrow">Private analytics dashboard</p>
            <h1>Visitor activity</h1>
            <p class="insights-note">Area attention is estimated from the section visible near the center of the viewport while the page is in focus.</p>
          </div>
          <div class="insights-header__actions">
            <label class="insights-filter">
              Range
              <select id="insights-range">
                <option value="7" ${state.range === "7" ? "selected" : ""}>Last 7 days</option>
                <option value="14" ${state.range === "14" ? "selected" : ""}>Last 14 days</option>
                <option value="30" ${state.range === "30" ? "selected" : ""}>Last 30 days</option>
                <option value="90" ${state.range === "90" ? "selected" : ""}>Last 90 days</option>
                <option value="all" ${state.range === "all" ? "selected" : ""}>All time</option>
              </select>
            </label>
            <button id="insights-sign-out" class="insights-secondary-button" type="button">Sign out</button>
          </div>
        </header>

        ${state.loading ? '<p class="insights-status">Loading analytics...</p>' : ""}
        ${state.error ? `<p class="insights-error">${escapeHtml(state.error)}</p>` : ""}

        <section class="insights-kpis">
          <article class="insights-kpi">
            <span class="insights-kpi__label">Unique visitors</span>
            <strong class="insights-kpi__value">${metrics.summary.visitors}</strong>
          </article>
          <article class="insights-kpi">
            <span class="insights-kpi__label">Sessions</span>
            <strong class="insights-kpi__value">${metrics.summary.sessions}</strong>
          </article>
          <article class="insights-kpi">
            <span class="insights-kpi__label">Page views</span>
            <strong class="insights-kpi__value">${metrics.summary.pageViews}</strong>
          </article>
          <article class="insights-kpi">
            <span class="insights-kpi__label">Returning visitors</span>
            <strong class="insights-kpi__value">${metrics.summary.returningVisitors}</strong>
          </article>
          <article class="insights-kpi">
            <span class="insights-kpi__label">Avg session time</span>
            <strong class="insights-kpi__value">${escapeHtml(formatDuration(metrics.summary.avgSessionDuration))}</strong>
          </article>
        </section>

        <div class="insights-grid">
          <section class="insights-card">
            <div class="insights-card__header">
              <h2>Visitors by day</h2>
              <p>Daily unique visitors and session volume.</p>
            </div>
            ${renderDailySeries(metrics.dailySeries)}
          </section>

          <section class="insights-card">
            <div class="insights-card__header">
              <h2>Top pages</h2>
              <p>Which pages were visited most, and how long visitors stayed.</p>
            </div>
            ${renderPageTable(metrics.pageStats)}
          </section>

          <section class="insights-card">
            <div class="insights-card__header">
              <h2>Top attention areas</h2>
              <p>Approximate section-level engagement across your site.</p>
            </div>
            ${renderAreaTable(metrics.areaStats)}
          </section>

          <section class="insights-card insights-card--wide">
            <div class="insights-card__header">
              <h2>Recent sessions</h2>
              <p>Use this to spot page flow, referrers, and return visits.</p>
            </div>
            ${renderRecentSessions(metrics.recentSessions)}
          </section>
        </div>
      </div>
    </section>
  `;

  document.getElementById("insights-range")?.addEventListener("change", (event) => {
    state.range = event.currentTarget.value;
    renderShell();
  });

  document.getElementById("insights-sign-out")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
  });
};

const fetchAllRows = async (tableName, orderColumn) => {
  const rows = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order(orderColumn, { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data?.length) break;

    rows.push(...data);

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return rows;
};

const loadAnalytics = async () => {
  if (!state.session || !supabase) return;

  state.loading = true;
  state.error = "";
  renderShell();

  try {
    const [sessions, pageViews] = await Promise.all([
      fetchAllRows(SESSION_TABLE, "started_at"),
      fetchAllRows(PAGE_VIEW_TABLE, "entered_at"),
    ]);

    state.sessions = sessions;
    state.pageViews = pageViews;
  } catch (error) {
    state.error = error.message || "Unable to load analytics.";
  } finally {
    state.loading = false;
    renderShell();
  }
};

const init = async () => {
  if (!appEl) return;

  renderShell();

  if (!supabase) return;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    state.error = error.message;
    renderShell();
    return;
  }

  state.session = data.session;
  renderShell();

  supabase.auth.onAuthStateChange((_event, session) => {
    state.session = session;
    state.error = "";
    renderShell();
    loadAnalytics();
  });

  if (state.session) {
    loadAnalytics();
  }
};

init();
