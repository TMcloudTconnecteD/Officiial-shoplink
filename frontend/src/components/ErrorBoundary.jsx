import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in component tree:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
          background: 'radial-gradient(circle at top, rgba(20,184,166,0.20), transparent 32%), linear-gradient(180deg, #f5f7f7 0%, #ebf5f1 100%)',
          fontFamily: 'Inter, Segoe UI, sans-serif'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(15,23,42,0.06)',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.14)',
            borderRadius: '28px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '28px 24px 20px',
              background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
              color: 'white'
            }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.8 }}>ShopLink</div>
              <h2 style={{ margin: '12px 0 8px', fontSize: '2rem', lineHeight: '1.1', letterSpacing: '-0.06em' }}>We hit a snag.</h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.96rem' }}>This screen was interrupted, but your campus shopping flow is still recoverable.</p>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 18px', color: '#475467', fontSize: '0.98rem' }}>
                Something unexpected broke while loading this part of the app. A quick refresh usually fixes it.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    border: 'none',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                    color: 'white',
                    fontWeight: 700,
                    padding: '12px 18px',
                    cursor: 'pointer',
                    boxShadow: '0 12px 20px rgba(15, 118, 110, 0.18)'
                  }}
                >
                  Refresh app
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  style={{
                    border: '1px solid rgba(15,23,42,0.08)',
                    borderRadius: '999px',
                    background: 'rgba(15, 118, 110, 0.04)',
                    color: '#0f172a',
                    fontWeight: 700,
                    padding: '12px 18px',
                    cursor: 'pointer'
                  }}
                >
                  Go home
                </button>
              </div>

              <details style={{ color: '#475467', fontSize: '0.8rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Technical details</summary>
                <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', background: '#f8fafc', borderRadius: '12px', padding: '12px', border: '1px solid rgba(15,23,42,0.04)' }}>
                  {String(this.state.error)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
