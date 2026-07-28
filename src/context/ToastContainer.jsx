import { createContext, useContext, useState } from "react";
import ToastContainer from "@/components/toast/toastContainer";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = "info") {
    const id = Date.now();

    setToasts((prev) => [
      ...prev,
      { id, message, type }
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((toast) => toast.id !== id)
      );
    }, 3000);
  }


  const toast = {
    success: (message) => showToast(message, "success"),
    error: (message) => showToast(message, "error"),
    warning: (message) => showToast(message, "warning"),
    info: (message) => showToast(message, "info"),
  };


  return (
    <ToastContext.Provider value={toast}>
      {children}

      <ToastContainer toasts={toasts} />

    </ToastContext.Provider>
  );
}


export function useToast() {
  return useContext(ToastContext);
}