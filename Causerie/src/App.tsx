import { useAppSession } from "./hooks/useAppSession";

import { OnboardingScreen } from "./components/onboarding/OnboardingScreen";
import { ConversationScreen } from "./components/conversation/ConversationScreen";
import { ResetApplicationButton } from "./components/ResetApplicationButton";

import "./styles/App.css";

export default function App() {
    const { state, reload } = useAppSession();

    return (
        <>
            {state.kind === "loading" && (
                <main className="conversation-placeholder" role="status">
                    Loading Causerie…
                </main>
            )}

            {state.kind === "error" && (
                <main className="conversation-placeholder">
                    <h1>Unable to open Causerie</h1>
                    <p role="alert">{state.message}</p>
                    <button type="button" onClick={reload}>
                        Retry
                    </button>
                </main>
            )}

            {state.kind === "onboarding" && (
                <OnboardingScreen onComplete={reload} />
            )}

            {state.kind === "ready" && (
                <ConversationScreen
                    userId={state.session.user.id}
                    context={state.session.context}
                />
            )}

            <ResetApplicationButton />
        </>
    );
}
