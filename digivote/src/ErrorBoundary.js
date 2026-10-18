import React from 'react';

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
