import { StrictMode, Suspense } from "react";

import ReactDOM from "react-dom/client";

import { App } from "./components/app";
import "./main.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <Suspense fallback="Loading">
      <App />
    </Suspense>
  </StrictMode>,
);
