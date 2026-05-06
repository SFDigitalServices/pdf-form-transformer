'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4"
        >
          <p className="text-[#0b0c0c] font-medium">Something went wrong.</p>
          <p className="text-sm text-[#535454]">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="h-9 px-4 bg-[#1b519e] text-white rounded text-sm font-medium hover:bg-[#001d4e] focus:outline-none focus:ring-2 focus:ring-[#1b519e] focus:ring-offset-1"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
