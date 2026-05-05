import React from "react";
import AppRoutes from "./routes/AppRoutes";
import ToastProvider from "./components/common/ToastProvider";

function App() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <AppRoutes />
      <ToastProvider />
    </div>
  );
}

export default App;