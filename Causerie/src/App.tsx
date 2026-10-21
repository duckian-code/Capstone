import { useAppSession } from "./hooks/useAppSession";

import { OnboardingScreen } from "./components/onboarding/OnboardingScreen";
import { ConversationScreen } from "./components/conversation/ConversationScreen";
import { ResetApplicationButton } from "./components/ResetApplicationButton";

import "./styles/App.css";
import { SettingsProvider } from "./components/settings/SettingsMenus";

export default function App() {
    const { state, reload, updateUser, updateGoals } = useAppSession();

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
                <SettingsProvider
                    key={state.session.user.id}
                    user={state.session.user}
                    onUserChange={updateUser}
                    goalSettings={state.session.goalSettings}
                    onGoalsChange={updateGoals}>
                    <ConversationScreen userId={state.session.user.id} context={state.session.context}/>
                </SettingsProvider>
            )}


            <ResetApplicationButton />
        </>
    );
}
