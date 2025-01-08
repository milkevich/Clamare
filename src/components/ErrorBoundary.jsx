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
        <div style={{height: '100vh', width: '90vw', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', maxWidth: '400px', margin: 'auto'}}>
          <p style={{margin: 0}}>CLAMÁRE:</p>
          <p style={{margin: 0}}>SOMETHING WENT WRONG. PLEASE TRY AGAIN OR CONTACT SUPPORT AT <a href='https://mail.google.com/mail/u/0/#inbox?compose=jrjtWvPfnzRbwkwVkzzFQGHxvtJmkwSnGvdshwRqDknzSrmCPGtGRMHLFKjWlvwcmZhPsrhQ'>SUPPORT@CLAMARE.STORE</a></p>
          </div>
        </div>
      )
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
