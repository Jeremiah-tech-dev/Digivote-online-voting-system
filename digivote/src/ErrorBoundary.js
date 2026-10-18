import React from 'react';

const RELOAD_KEY = 'digivote-chunk-reload';

// A tab running an old release may ask for a code file that no longer exists.
// Loading the current release fixes that, so reload once (never in a loop).
const isChunkLoadError = (error) =>
  error && (error.name === 'ChunkLoadError' || /Loading (CSS )?chunk [\w-]+ failed/i.test(error.message || ''));

const reloadOnce = () => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 30000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch (storageError) {
    return false;
  }
  window.location.reload();
  return true;
};

// Last line of defence: if any part of the page crashes, show a message with a
// reload button instead of leaving the visitor on a blank white page.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (isChunkLoadError(error) && reloadOnce()) return;
    console.error('Page crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="crash-screen" role="alert">
        <img src="/IEBC.png" alt="IEBC Logo" className="crash-logo" />
        <h1>Something went wrong</h1>
        <p>The page ran into a problem. Your vote and login are not affected.</p>
        <button type="button" onClick={() => window.location.reload()}>Reload the page</button>
      </div>
    );
  }
}

export default ErrorBoundary;
