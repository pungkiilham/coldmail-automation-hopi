"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-40">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
              <p className="text-red-700 font-medium text-lg">Something went wrong</p>
              <p className="text-red-500 text-sm mt-1">Try refreshing the page.</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline cursor-pointer"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
