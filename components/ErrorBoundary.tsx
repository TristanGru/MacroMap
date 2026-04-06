import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Globe error:", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--color-bg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-muted)",
            fontFamily: "'IBM Plex Sans', sans-serif",
            textAlign: "center",
            gap: "12px",
          }}
          role="alert"
        >
          <p style={{ fontSize: "20px", color: "var(--color-text)", margin: 0 }}>
            Globe unavailable
          </p>
          <p style={{ fontSize: "14px", margin: 0 }}>
            WebGL is not supported in this browser.
          </p>
          <p style={{ fontSize: "12px", margin: 0, color: "var(--color-text-dim)" }}>
            {this.state.error?.message}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
