import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  confirmVariant = "primary", 
  loading = false 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button 
            variant={confirmVariant} 
            onClick={onConfirm} 
            isLoading={loading} 
            className="w-full sm:w-auto sm:ml-3"
          >
            {confirmText}
          </Button>
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={loading}
            className="mt-3 w-full sm:mt-0 sm:w-auto"
          >
            Cancel
          </Button>
        </>
      }
    >
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
