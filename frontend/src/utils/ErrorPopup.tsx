import React, { useState, useEffect,  } from 'react';
import type { ReactElement } from 'react';

// Global state management
let globalSetError: ((error: string | null) => void) | null = null;

// Global function to show errors
export const showError = (message: string = "An error occurred"): void => {
  if (globalSetError) {
    globalSetError(message);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (globalSetError) {
        globalSetError(null);
      }
    }, 4000);
  }
};

// Error popup component props
interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

// Error popup component
function ErrorPopup({ message, onClose }: ErrorPopupProps): ReactElement {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = (): void => {
    setIsRemoving(true);
    setTimeout(onClose, 300); // Match exit animation duration
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>): void => {
    (e.target as HTMLButtonElement).style.backgroundColor = '#f5c6cb';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>): void => {
    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
  };

  return (
    <div
      style={{
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: '280px',
        transform: isRemoving 
          ? 'translateX(100%) scale(0.95)' 
          : isVisible 
            ? 'translateX(0) scale(1)' 
            : 'translateX(100%) scale(0.95)',
        opacity: isRemoving ? 0 : isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
      onClick={handleClose}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Error Icon */}
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: '#dc3545',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          flexShrink: 0
        }}>
          !
        </div>
        
        {/* Error Message */}
        <span style={{
          color: '#721c24',
          fontSize: '14px',
          fontWeight: '500',
          lineHeight: '1.4'
        }}>
          {message}
        </span>
      </div>
      
      {/* Close Button */}
      <button
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          handleClose();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#721c24',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0',
          marginLeft: '8px',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '3px',
          flexShrink: 0
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        ×
      </button>
    </div>
  );
}

// Main component that should be placed in your app
export default function ErrorPopupProvider(): ReactElement {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Connect global state to local state
    globalSetError = setError;
    
    // Cleanup on unmount
    return () => {
      globalSetError = null;
    };
  }, [error]);

  const removeError = (): void => {
    setError(null);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '350px',
      pointerEvents: 'none' // Allow clicks to pass through when no error
    }}>
      {error && (
        <div style={{ pointerEvents: 'auto' }}>
          <ErrorPopup 
            message={error} 
            onClose={removeError} 
          />
        </div>
      )}
    </div>
  );
}