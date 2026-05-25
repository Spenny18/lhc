import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Migration safety net: anyone arriving with an old hash-style URL
// (e.g. /#/mls/A2305467 from a bookmark or stale Google index entry)
// gets transparently rewritten to the clean path (/mls/A2305467) before
// React Router boots. No flash, no extra navigation.
if (window.location.hash.startsWith("#/")) {
  const cleanPath = window.location.hash.slice(1); // strips the leading "#"
  window.history.replaceState(null, "", cleanPath || "/");
}

createRoot(document.getElementById("root")!).render(<App />);
