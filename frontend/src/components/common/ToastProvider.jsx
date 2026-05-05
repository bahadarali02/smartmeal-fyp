import React from "react";
import { Toaster } from "react-hot-toast";

function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      toastOptions={{
        duration: 2600,
        style: {
          borderRadius: "18px",
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 18px 45px rgba(15, 23, 42, 0.10), 0 4px 14px rgba(15, 23, 42, 0.06)",
          padding: "14px 16px",
          fontSize: "14px",
          fontWeight: 600,
          maxWidth: "92vw",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
      }}
      containerStyle={{
        zIndex: 99999,
      }}
    />
  );
}

export default ToastProvider;