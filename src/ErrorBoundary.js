// src/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem" }}>
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h2>Something went wrong</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              We're sorry, but an unexpected error occurred. Please try refreshing the page.
            </p>
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Refresh Page
              </button>
              <button 
                onClick={() => window.location.href = "/dashboard"} 
                className="btn btn-secondary"
              >
                Go to Dashboard
              </button>
            </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details style={{ marginTop: "2rem", textAlign: "left" }}>
                  <summary style={{ cursor: "pointer", color: "var(--text-secondary)" }}>
                    Error Details (Development)
                  </summary>
                  <pre style={{ 
                    background: "#f5f5f5", 
                    padding: "1rem", 
                    borderRadius: "4px", 
                    overflow: "auto",
                    fontSize: "0.8rem",
                    marginTop: "1rem"
                  }}>
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error toast component for non-critical errors
export function ErrorToast({ message, onClose, type = "error" }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: type === "error" ? "#fef2f2" : "#f0f9ff",
        border: `1px solid ${type === "error" ? "#fecaca" : "#bae6fd"}`,
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "var(--shadow-lg)",
        zIndex: 1000,
        maxWidth: "400px",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.5rem"
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>
        {type === "error" ? "❌" : "ℹ️"}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ 
          color: type === "error" ? "#dc2626" : "#0369a1",
          fontSize: "0.9rem",
          lineHeight: "1.4"
        }}>
          {message}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontSize: "1.2rem",
          lineHeight: "1"
        }}
      >
        ×
      </button>
    </div>
  );
}

// Hook for showing error toasts
export function useErrorToast() {
  const [errors, setErrors] = React.useState([]);

  const showError = React.useCallback((message, duration = 5000) => {
    const id = Date.now();
    setErrors(prev => [...prev, { id, message, type: "error" }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setErrors(prev => prev.filter(error => error.id !== id));
      }, duration);
    }
  }, []);

  const showInfo = React.useCallback((message, duration = 3000) => {
    const id = Date.now();
    setErrors(prev => [...prev, { id, message, type: "info" }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setErrors(prev => prev.filter(error => error.id !== id));
      }, duration);
    }
  }, []);

  const removeError = React.useCallback((id) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const ErrorToasts = React.useMemo(() => (
    <>
      {errors.map(error => (
        <ErrorToast
          key={error.id}
          message={error.message}
          type={error.type}
          onClose={() => removeError(error.id)}
        />
      ))}
    </>
  ), [errors, removeError]);

  return { showError, showInfo, ErrorToasts };
}

// Loading spinner component
export function LoadingSpinner({ message = "Loading...", size = "medium" }) {
  const sizeStyles = {
    small: { width: "20px", height: "20px" },
    medium: { width: "40px", height: "40px" },
    large: { width: "60px", height: "60px" }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      gap: "1rem",
      padding: "2rem"
    }}>
      <div 
        className="loading-spinner" 
        style={sizeStyles[size]}
      />
      <p style={{ color: "var(--text-secondary)", margin: 0 }}>
        {message}
      </p>
    </div>
  );
}

// Error page component for routing errors
export function ErrorPage({ 
  title = "Page Not Found", 
  message = "The page you're looking for doesn't exist.",
  showHomeButton = true 
}) {
  return (
    <div className="container" style={{ maxWidth: "500px", margin: "4rem auto", textAlign: "center" }}>
      <div className="card" style={{ padding: "3rem" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
        <h1>{title}</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          {message}
        </p>
        {showHomeButton && (
          <button 
            onClick={() => window.location.href = "/dashboard"}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorBoundary;