import React from 'react';
import { Link } from 'react-router-dom';
import { HiExclamation, HiHome, HiRefresh } from 'react-icons/hi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.state = {
      hasError: true,
      error: error,
      errorInfo: errorInfo
    };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <HiExclamation className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-white/90 text-sm mt-1">
                    We encountered an unexpected error
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-slate-600 text-base mb-6">
                Don't worry! Our team has been notified and we're working on fixing this issue. 
                In the meantime, you can try refreshing the page or going back to the homepage.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <summary className="cursor-pointer font-semibold text-slate-700 text-sm mb-2">
                    Technical Details (Development Mode)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div className="text-xs">
                      <p className="font-semibold text-red-600 mb-1">Error:</p>
                      <pre className="bg-red-50 p-3 rounded text-red-700 overflow-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div className="text-xs">
                        <p className="font-semibold text-slate-600 mb-1">Stack Trace:</p>
                        <pre className="bg-slate-100 p-3 rounded text-slate-600 overflow-auto max-h-48">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 hover:shadow-teal-300"
                >
                  <HiRefresh className="w-5 h-5" />
                  Refresh Page
                </button>

                <Link
                  to="/"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all"
                >
                  <HiHome className="w-5 h-5" />
                  Go to Homepage
                </Link>
              </div>

              {/* Help Text */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500 text-center">
                  If this problem persists, please{' '}
                  <a 
                    href="mailto:support@ptpi.com" 
                    className="text-teal-600 hover:text-teal-700 font-medium underline"
                  >
                    contact our support team
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
