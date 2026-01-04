import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { CustomMuiThemeProvider } from "./theme/MuiThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <CustomMuiThemeProvider>
    <App />
  </CustomMuiThemeProvider>
);
