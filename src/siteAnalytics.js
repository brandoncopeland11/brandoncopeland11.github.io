import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient.js";

const VISITOR_STORAGE_KEY = "portfolio.analytics.visitor";
const SESSION_STORAGE_KEY = "portfolio.analytics.session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const FLUSH_INTERVAL_MS = 15_000;
const SESSION_TABLE = "analytics_sessions";
const PAGE_VIEW_TABLE = "analytics_page_views";

const readStorage = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (storage, key, value) => {
  try {
    storage.setItem(key, value);
  } catch {
    // Ignore storage failures so the site still works.
  }
};

const parseJson = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const createId = () => window.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`;

const isLocalHost = () =>
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

const shouldTrackLocally = () => import.meta.env.VITE_TRACK_LOCAL_ANALYTICS === "true";

const shouldSkipAnalytics = () => {
  if (!isSupabaseConfigured()) return true;
  if (document.body?.dataset.analyticsOptOut === "true") return true;
  if (isLocalHost() && !shouldTrackLocally()) return true;
  return false;
};

const getVisitorId = () => {
  const stored = readStorage(window.localStorage, VISITOR_STORAGE_KEY);
  if (stored) return stored;

  const visitorId = createId();
  writeStorage(window.localStorage, VISITOR_STORAGE_KEY, visitorId);
  return visitorId;
};

const getCurrentPath = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

const getSessionState = (visitorId) => {
  const now = new Date();
  const storedSession = parseJson(readStorage(window.localStorage, SESSION_STORAGE_KEY));
  const lastSeenAt = storedSession?.lastSeenAt ? new Date(storedSession.lastSeenAt) : null;
  const isExpired =
    !lastSeenAt || Number.isNaN(lastSeenAt.getTime()) || now.getTime() - lastSeenAt.getTime() > SESSION_TIMEOUT_MS;
  const needsNewSession = !storedSession || storedSession.visitorId !== visitorId || isExpired;

  const session = needsNewSession
    ? {
        id: createId(),
        visitorId,
        startedAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        landingPath: getCurrentPath(),
      }
    : {
        ...storedSession,
        lastSeenAt: now.toISOString(),
      };

  writeStorage(window.localStorage, SESSION_STORAGE_KEY, JSON.stringify(session));

  return { session, isNewSession: needsNewSession };
};

const getScrollPercent = () => {
  const scrollingEl = document.scrollingElement || document.documentElement;
  const scrollableHeight = scrollingEl.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) return 100;
  return Math.max(0, Math.min(100, (scrollingEl.scrollTop / scrollableHeight) * 100));
};

const getTrackableAreas = () => {
  const areas = [];

  const addArea = (element, label) => {
    if (!(element instanceof HTMLElement)) return;
    const normalizedLabel = label?.trim();
    if (!normalizedLabel) return;
    areas.push({ element, label: normalizedLabel });
  };

  if (document.body.classList.contains("case-study-page")) {
    addArea(document.querySelector(".case-study-header"), "Header");

    document.querySelectorAll(".case-study-content h2[id]").forEach((heading) => {
      addArea(heading.closest("section") || heading, heading.textContent || heading.id);
    });

    addArea(document.querySelector(".next-project"), "Next project");
    return areas;
  }

  document.querySelectorAll("main section[id], footer[id]").forEach((section) => {
    const labelledById = section.getAttribute("aria-labelledby");
    const labelledByEl = labelledById ? document.getElementById(labelledById) : null;
    const heading = section.querySelector("h1, h2, h3");
    const fallbackId = section.id ? section.id.replace(/-/g, " ") : "Section";

    addArea(
      section,
      labelledByEl?.textContent || heading?.textContent || fallbackId
    );
  });

  return areas;
};

const resolveActiveArea = (areas) => {
  if (!areas.length) return null;

  const focusLine = window.innerHeight * 0.38;
  let containingArea = null;

  for (const area of areas) {
    const rect = area.element.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

    if (rect.top <= focusLine && rect.bottom >= focusLine) {
      containingArea = area;
      break;
    }
  }

  if (containingArea) return containingArea.label;

  return areas.reduce((closest, area) => {
    const rect = area.element.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return closest;

    const midpoint = rect.top + rect.height / 2;
    const distance = Math.abs(midpoint - focusLine);

    if (distance < closest.distance) {
      return { label: area.label, distance };
    }

    return closest;
  }, { label: areas[0].label, distance: Number.POSITIVE_INFINITY }).label;
};

const roundSecondsMap = (areaTimesMs) =>
  Object.fromEntries(
    Object.entries(areaTimesMs)
      .map(([label, value]) => [label, Math.max(0, Math.round(value / 1000))])
      .filter(([, seconds]) => seconds > 0)
  );

export const initSiteAnalytics = () => {
  if (shouldSkipAnalytics()) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const visitorId = getVisitorId();
  const { session } = getSessionState(visitorId);
  const pageViewId = createId();
  const enteredAt = new Date().toISOString();
  const trackableAreas = getTrackableAreas();

  let currentAreaLabel = null;
  let engagementStartedAt = null;
  let engagedMs = 0;
  let maxScrollPct = getScrollPercent();
  let flushTimerId = null;
  let isFlushing = false;
  let pendingFlush = false;
  const areaTimesMs = {};

  const isEngaged = () => document.visibilityState === "visible" && document.hasFocus();

  const syncMeasurements = () => {
    const now = Date.now();

    if (engagementStartedAt !== null) {
      const delta = Math.max(0, now - engagementStartedAt);
      engagedMs += delta;
      if (currentAreaLabel) {
        areaTimesMs[currentAreaLabel] = (areaTimesMs[currentAreaLabel] || 0) + delta;
      }
    }

    maxScrollPct = Math.max(maxScrollPct, getScrollPercent());

    if (isEngaged()) {
      engagementStartedAt = now;
      currentAreaLabel = resolveActiveArea(trackableAreas);
      return;
    }

    engagementStartedAt = null;
  };

  const buildSessionPayload = () => {
    const nowIso = new Date().toISOString();
    const nextSession = { ...session, lastSeenAt: nowIso };
    writeStorage(window.localStorage, SESSION_STORAGE_KEY, JSON.stringify(nextSession));

    return {
      id: session.id,
      visitor_id: visitorId,
      started_at: session.startedAt,
      last_seen_at: nowIso,
      ended_at: nowIso,
      landing_path: session.landingPath,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    };
  };

  const buildPageViewPayload = () => ({
    id: pageViewId,
    session_id: session.id,
    visitor_id: visitorId,
    path: window.location.pathname,
    page_title: document.title,
    referrer: document.referrer || null,
    entered_at: enteredAt,
    last_active_at: new Date().toISOString(),
    duration_seconds: Math.max(0, Math.round(engagedMs / 1000)),
    max_scroll_pct: Number(maxScrollPct.toFixed(2)),
    area_times: roundSecondsMap(areaTimesMs),
  });

  const flush = async () => {
    syncMeasurements();

    if (isFlushing) {
      pendingFlush = true;
      return;
    }

    isFlushing = true;

    try {
      const sessionPayload = buildSessionPayload();
      const pageViewPayload = buildPageViewPayload();

      const [{ error: sessionError }, { error: pageViewError }] = await Promise.all([
        supabase.from(SESSION_TABLE).upsert(sessionPayload, { onConflict: "id" }),
        supabase.from(PAGE_VIEW_TABLE).upsert(pageViewPayload, { onConflict: "id" }),
      ]);

      if (sessionError) console.error("Analytics session flush failed", sessionError);
      if (pageViewError) console.error("Analytics page flush failed", pageViewError);
    } catch (error) {
      console.error("Analytics flush failed", error);
    } finally {
      isFlushing = false;
      if (pendingFlush) {
        pendingFlush = false;
        flush();
      }
    }
  };

  const scheduleFlush = () => {
    window.clearInterval(flushTimerId);
    flushTimerId = window.setInterval(flush, FLUSH_INTERVAL_MS);
  };

  const handleActivity = () => {
    syncMeasurements();
  };

  syncMeasurements();
  scheduleFlush();
  flush();

  window.addEventListener("scroll", handleActivity, { passive: true });
  window.addEventListener("resize", handleActivity);
  window.addEventListener("focus", handleActivity);
  window.addEventListener("blur", handleActivity);
  document.addEventListener("visibilitychange", () => {
    handleActivity();
    if (document.visibilityState === "hidden") {
      flush();
    }
  });
  window.addEventListener("pagehide", () => {
    syncMeasurements();
    flush();
  });
};
