import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { dal } from "./data/dal";

async function start() {
    await dal.initialize();

    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
}

start().catch(error => {
    console.error("Database initialization failed:", error);
});