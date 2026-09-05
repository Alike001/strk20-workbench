import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@strk20-workbench/react/styles.css";

import { App } from "./app";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#root");

if (!root) throw new Error("Example root element was not found.");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
