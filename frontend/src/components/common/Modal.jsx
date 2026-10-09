import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { classNames } from '../../utils/helpers';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full m-4',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
          aria-hidden="true" 
        />

        <div className={classNames(
          "relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full",
          sizes[size]
        )}>
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-gray-200 flex justify-between items-center">
            {title && <h3 className="text-lg font-semibold leading-6 text-gray-900">{title}</h3>}
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {children}
          </div>

          {footer && (
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
