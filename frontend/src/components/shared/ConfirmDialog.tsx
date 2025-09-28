import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info" | "success";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  type = "danger",
}) => {
  if (!isOpen) return null;

  const getTypeClasses = () => {
    switch (type) {
      case "danger":
        return "btn-danger";
      case "warning":
        return "btn-warning";
      case "info":
        return "btn-info";
      case "success":
        return "btn-success";
      default:
        return "btn-danger";
    }
  };

  const getIconClass = () => {
    switch (type) {
      case "danger":
        return "bi-exclamation-triangle-fill text-danger";
      case "warning":
        return "bi-exclamation-triangle-fill text-warning";
      case "info":
        return "bi-info-circle-fill text-info";
      case "success":
        return "bi-check-circle-fill text-success";
      default:
        return "bi-exclamation-triangle-fill text-danger";
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title d-flex align-items-center">
              <i className={`${getIconClass()} me-2 fs-4`}></i>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn ${getTypeClasses()}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;