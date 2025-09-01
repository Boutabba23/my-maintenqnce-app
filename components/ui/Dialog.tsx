
import React, { useEffect } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative z-50 flex flex-col w-full max-w-lg border bg-background shadow-lg duration-200 sm:rounded-lg max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const DialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`flex-shrink-0 flex flex-col space-y-1.5 text-center sm:text-left p-6 ${className || ''}`}>
    {children}
  </div>
);

const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}>
    {children}
  </h2>
);

const DialogDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={`text-sm text-muted-foreground ${className || ''}`}>
    {children}
  </p>
);

const DialogContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`flex-1 p-6 overflow-y-auto ${className || ''}`}>{children}</div>
);

const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`flex-shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t ${className || ''}`}>
    {children}
  </div>
);

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter };