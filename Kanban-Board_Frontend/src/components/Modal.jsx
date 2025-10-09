import React, { useRef, useEffect } from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
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
      className="bg-gray-800 rounded-xl w-full max-w-md p-6 border-none"
      onClick={(e) => {
        // Kliknięcie poza modalem
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
