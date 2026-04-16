import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import { AppProvider } from "./contexts/AppContext";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AppProvider>
);
