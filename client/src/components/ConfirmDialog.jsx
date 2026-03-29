import Modal from './Modal';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  confirmVariant = "primary",
  showCancel = true 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-customText-secondary text-[1rem] leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          {showCancel && (
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          )}
          <button 
            className={`btn btn-${confirmVariant}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
