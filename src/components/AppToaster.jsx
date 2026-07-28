import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "@/hooks/useTheme";

export function AppToaster() {
  const { theme } = useTheme();

  return (
    <ToastContainer
      theme={theme === "dark" ? "dark" : "light"}
      newestOnTop
      pauseOnFocusLoss={false}
      aria-label="Notificações"
    />
  );
}
