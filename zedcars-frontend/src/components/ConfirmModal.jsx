import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ show, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
  if (!show) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <div className={`confirm-modal-header ${type}`}>
          <h5>{title}</h5>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="btn-cancel" onClick={onCancel}>{cancelText}</button>
          <button className={`btn-confirm ${type}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
