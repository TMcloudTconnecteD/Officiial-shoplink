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
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white shadow rounded-lg p-8 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">An unexpected error occurred. Please try refreshing the page.</p>
            <details className="text-xs text-left text-gray-500">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="whitespace-pre-wrap break-all mt-2">{String(this.state.error)}</pre>
            </details>
            <div className="mt-6">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-500 text-white rounded">Reload</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
