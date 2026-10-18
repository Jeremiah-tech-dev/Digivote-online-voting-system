import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// A browser tab that stays open keeps running the code it first loaded, because
// moving between pages in a single-page app never reloads it. After a new version
// is deployed, such a tab would keep running old (possibly buggy) code until the
// user refreshes. This hook notices when a newer version is live and loads it on
// the next page change, so every visitor always ends up on the current release.

const CHECK_EVERY_MS = 5 * 60 * 1000;
const MAIN_SCRIPT = /\/static\/js\/main\.[a-z0-9]+\.js/;

// The main bundle this tab is running, e.g. "/static/js/main.bcaaac5f.js"
export const runningBuild = () => {
  const script = Array.from(document.scripts).find((s) => MAIN_SCRIPT.test(s.src));
  return script ? script.src.match(MAIN_SCRIPT)[0] : null;
};

// The main bundle the server is currently serving
export const latestBuild = async () => {
  try {
    const response = await fetch(`/index.html?check=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const match = (await response.text()).match(MAIN_SCRIPT);
    return match ? match[0] : null;
  } catch (error) {
    return null; // offline or blocked: keep running the current version
  }
};

export const useReloadOnNewRelease = () => {
  const location = useLocation();
  const stale = useRef(false);
  const firstRender = useRef(true);

  // Check on start, every few minutes, and whenever the tab becomes visible again
  useEffect(() => {
    const running = runningBuild();
    if (!running) return undefined; // development server or tests: nothing to compare

    const check = async () => {
      const latest = await latestBuild();
      if (latest && latest !== running) stale.current = true;
    };

    check();
    const timer = setInterval(check, CHECK_EVERY_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // Swap to the new version at a page change, never in the middle of a page
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (stale.current) window.location.reload();
  }, [location.pathname]);
};
