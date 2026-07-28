import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";

import { ThemeProvider } from "./context/ThemeProvider";
import { AuthProvider } from "./context/AuthProvider";
import { ToastProvider } from "./context/ToastContainer";

import { TooltipProvider } from "@/components/ui/tooltip";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>

      <AuthProvider>

        <ToastProvider>

          <TooltipProvider>

            <App />

          </TooltipProvider>

        </ToastProvider>

      </AuthProvider>

    </ThemeProvider>
  </StrictMode>
);