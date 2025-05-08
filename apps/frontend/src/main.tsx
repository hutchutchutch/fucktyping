import '@fontsource/press-start-2p'; // Import the font
import { createRoot } from "react-dom/client";
import App from "@app/App";
import "@app/index.css";

// Note: We don't need to import React95 CSS directly
// React95 uses vanilla-extract for styling which gets
// bundled with the components automatically

createRoot(document.getElementById("root")!).render(<App />);
