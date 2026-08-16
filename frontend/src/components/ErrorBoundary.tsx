import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, LayoutDashboard, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary caught exception]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    window.location.reload();
  };

  private handleGoHome = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          color: '#09090b',
          fontFamily: "'Inter', sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          textAlign: 'center'
        }}>
          {/* Error Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <AlertTriangle size={32} />
          </div>

          <h1 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            marginBottom: '12px',
            color: '#09090b'
          }}>
            We couldn't complete the analysis
          </h1>

          <p style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: '#475569',
            maxWidth: '520px',
            marginBottom: '32px'
          }}>
            An unexpected error occurred while rendering the workflow results. Your input data is safe. You can retry the operation or return to the main dashboard.
          </p>

          {/* Action CTAs */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '36px'
          }}>
            <button
              onClick={this.handleReset}
              className="btn-black"
              style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 600 }}
            >
              <RefreshCw size={16} />
              <span>Retry Analysis</span>
            </button>
            <button
              onClick={this.handleGoHome}
              className="btn-outline"
              style={{ padding: '12px 24px', fontSize: '14px' }}
            >
              <Home size={16} />
              <span>Return to Home</span>
            </button>
          </div>

          {/* Expandable Technical Details for Developers */}
          <div style={{ maxWidth: '640px', width: '100%', textAlign: 'left' }}>
            <button
              onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: '0 auto',
                padding: '8px'
              }}
            >
              <span>{this.state.showDetails ? 'Hide Technical Details' : 'Show Technical Details'}</span>
              {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {this.state.showDetails && (
              <div style={{
                marginTop: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#334155',
                overflowX: 'auto',
                maxHeight: '200px'
              }}>
                <strong style={{ color: '#dc2626' }}>{this.state.error?.name}: {this.state.error?.message}</strong>
                <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap', fontSize: '11px', color: '#64748b' }}>
                  {this.state.errorInfo?.componentStack || this.state.error?.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
