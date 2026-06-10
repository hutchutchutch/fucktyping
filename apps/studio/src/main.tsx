import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { Responder } from "./responder/Responder";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root");
// Minimal path routing: /respond/:id is the voice form-filling page; everything else
// is the authoring studio.
const Root = window.location.pathname.startsWith("/respond/") ? Responder : App;
createRoot(root).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
