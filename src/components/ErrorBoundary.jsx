import React, { Component } from 'react';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unexpected runtime crash:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Safe redirection back to the dashboard route
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col items-center justify-center px-4 relative hero-gradient text-center">
          <div className="max-w-md glass-card rounded-2xl p-8 relative z-10 space-y-6">
            <div className="relative w-36 h-36 mx-auto mb-2 flex items-center justify-center">
              {/* Decorative Glowing Rings */}
              <div className="absolute inset-0 border-2 border-red-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
              <div className="absolute inset-4 border border-red-500/20 rounded-full animate-pulse"></div>
              <span className="material-symbols-outlined text-[72px] text-red-500 gold-glow">
                error
              </span>
            </div>

            <div className="space-y-2">
              <span className="font-label-sm text-label-sm text-red-400 bg-red-950/20 px-4 py-1 rounded-full uppercase tracking-widest border border-red-500/30">
                System Error
              </span>
              <h2 className="font-display-lg text-headline-lg font-bold">Something went wrong</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                An unexpected runtime error has occurred. Your session has been protected from crashing the browser.
              </p>
              {this.state.error && (
                <pre className="text-[10px] text-red-400/80 bg-red-950/40 p-3 rounded-lg overflow-x-auto text-left max-h-32 font-mono">
                  {this.state.error.toString()}
                </pre>
              )}
            </div>

            <div className="pt-4 flex justify-center">
              <Button onClick={this.handleReset} variant="primary" className="w-full sm:w-auto">
                Return Dashboard
              </Button>
            </div>
          </div>

          {/* Backdrop Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-3xl -z-10"></div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
