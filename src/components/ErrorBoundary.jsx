import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{height: 'calc(95vh - 2.5rem)', width: 'calc(100vw - 2.5rem)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.25rem'}}>
          <div style={{fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', maxWidth: '400px', margin: 'auto'}}>
          <p style={{margin: 0}}>CLAMÁRE:</p>
          <p style={{margin: 0}}>SOMETHING WENT WRONG. PLEASE TRY AGAIN OR CONTACT SUPPORT AT <a href='mailto:support@clamare.store' style={{color: 'var(--main-color)', fontWeight: '600', textDecoration: 'none'}}>SUPPORT@CLAMARE.STORE</a></p>
          </div>
        </div>
      )
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
