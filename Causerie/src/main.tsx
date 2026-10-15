import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { dal } from "./data/dal";
import { initializeDevSession } from "./services/dev-session";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Application root element was not found.");
}

const root = ReactDOM.createRoot(rootElement);

async function start() {
    root.render(
        <main className="conversation-placeholder" role="status">
            Starting Causerie…
        </main>,
    );

    await dal.initialize();

    const session = await initializeDevSession();

    root.render(
        <React.StrictMode>
            <App
                currentUser={session.currentUser}
                goals={session.goals}
            />
        </React.StrictMode>,
    );
}

void start().catch((error: unknown) => {
    console.error("Application initialization failed:", error);

    const message =
        error instanceof Error ? error.message : String(error);

    root.render(
        <main className="conversation-placeholder">
            <h1>Unable to start Causerie</h1>
            <p role="alert">{message}</p>

            <button
                type="button"
                onClick={() => window.location.reload()}
            >
                Retry
            </button>
        </main>,
    );
});
