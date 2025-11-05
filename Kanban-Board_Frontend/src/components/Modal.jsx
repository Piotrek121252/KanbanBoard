import React, { useRef, useEffect } from "react";

const Modal = ({ isOpen, onClose, title, children, width = "30rem" }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      style={{ width }}
      className="bg-gray-800 rounded-xl p-6 border-none"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white"
      >
        ✕
      </button>

      {title && (
        <h2 className="text-xl font-semibold mb-4 text-gray-100">{title}</h2>
      )}

      <div>{children}</div>
    </dialog>
  );
};

export default Modal;
