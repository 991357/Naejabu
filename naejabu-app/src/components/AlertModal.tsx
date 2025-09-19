'use client';

import React from 'react';
import Modal from './Modal';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <p className="mb-6 text-lg">{message}</p>
        <button
          onClick={onClose}
          className="bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-8 rounded-lg transition-colors"
        >
          확인
        </button>
      </div>
    </Modal>
  );
};

export default AlertModal;
