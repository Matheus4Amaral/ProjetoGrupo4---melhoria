import { toast } from "react-toastify";

const DEFAULTS = {
  position: "top-right",
  autoClose: 4000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
};

export function notifySuccess(message, options) {
  return toast.success(message, { ...DEFAULTS, ...options });
}

export function notifyError(message, options) {
  return toast.error(message, { ...DEFAULTS, autoClose: 6000, ...options });
}

export function notifyInfo(message, options) {
  return toast.info(message, { ...DEFAULTS, ...options });
}
