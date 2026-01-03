/**
 * DevSamplerAccess Component
 *
 * Development utility component for easy access to ComponentSampler.
 * Provides a floating button to quickly open the sampler in a separate tab.
 */

import { useState, useEffect } from 'react';

/**
 * DevSamplerAccess
 *
 * Development-only component that provides a floating button
 * to quickly access the ComponentSampler for testing.
 */
export function DevSamplerAccess() {
  const [isVisible, setIsVisible] = useState(false);

  // Show only in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Check URL parameter to auto-open sampler (optional feature)
    const urlParams = new URLSearchParams(window.location.search);
    const autoOpen = urlParams.get('sampler') === 'true';

    if (autoOpen) {
      window.open('/theme-sampler.html', '_blank');
    }
    
    // Always show button in dev
    setIsVisible(true);
  }, []);

  if (!isDevelopment || !isVisible) {
    return null;
  }

  const handleOpenSampler = () => {
    window.open('/theme-sampler.html', '_blank');
  };

  return (
    <>
      {/* Floating button for quick access */}
      <div
        className="dev-sampler-toggle"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'block',
        }}
      >
        <button
          onClick={handleOpenSampler}
          className="dev-sampler-btn"
          style={{
            backgroundColor: 'var(--aurora-1)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.3s ease',
            fontSize: '24px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
          }}
          title="Open Theme Sampler"
        >
          🎨
        </button>
      </div>

      {/* Instructions overlay */}
      <div
        className="dev-sampler-instructions"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'block',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '250px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
      </div>
    </>
  );
}

/* Add styles for development components */
const devStyles = `
  .dev-sampler-toggle {
    animation: fadeIn 0.5s ease-in;
  }

  .dev-sampler-btn {
    will-change: transform, box-shadow;
    transform: translate3d(0, 0, 0);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .dev-sampler-instructions {
      display: none !important;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'dev-sampler-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = devStyles;
    document.head.appendChild(style);
  }
}

export default DevSamplerAccess;
