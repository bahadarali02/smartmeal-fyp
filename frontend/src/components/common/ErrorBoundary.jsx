import React from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Something went wrong.",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SmartMeal UI Error:", error);
    console.error("SmartMeal Error Info:", errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
          <div className="relative w-full max-w-xl overflow-hidden rounded-[36px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-orange-100/80 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-lg font-semibold text-white shadow-sm">
                SM
              </div>

              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
                Something broke on this screen
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                SmartMeal caught this error safely instead of showing a blank
                page. Try refreshing the page or return home.
              </p>

              {this.state.errorMessage ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-400">
                    Error
                  </p>
                  <p className="mt-2 text-sm leading-6 text-red-700">
                    {this.state.errorMessage}
                  </p>
                </div>
              ) : null}

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button onClick={this.handleReload} className="btn-primary">
                  Reload Page
                </button>

                <Link to="/" className="btn-secondary">
                  Go Home
                </Link>
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