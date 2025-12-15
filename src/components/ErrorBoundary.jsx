import React from "react";
import { HiExclamation, HiRefresh } from "react-icons/hi";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="text-center max-w-md w-full">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-red-50/50">
              <HiExclamation className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Something went wrong
            </h2>

            <p className="text-slate-500 mb-8 leading-relaxed">
              We apologize for the inconvenience. The application encountered an
              unexpected error.
            </p>

            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <HiRefresh className="w-5 h-5" />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
