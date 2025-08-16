import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={errorContainer}>
          <div style={errorCard}>
            <div style={errorIcon}>⚠️</div>
            <h2 style={errorTitle}>Something went wrong</h2>
            <p style={errorMessage}>
              We&apos;re sorry, but something unexpected happened. Please refresh the page and try again.
            </p>
            <button 
              style={refreshButton}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error boundary styles
const errorContainer = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};

const errorCard = {
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '20px',
  padding: '40px',
  textAlign: 'center',
  maxWidth: '500px',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
};

const errorIcon = {
  fontSize: '48px',
  marginBottom: '20px',
};

const errorTitle = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  marginBottom: '16px',
  margin: '0 0 16px 0',
};

const errorMessage = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '1.6',
  marginBottom: '24px',
  margin: '0 0 24px 0',
};

const refreshButton = {
  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
