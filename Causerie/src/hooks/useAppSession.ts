import { useCallback, useEffect, useState } from "react";
import { loadAppSession, type AppSession} from "../services/app-session";
import { selectedGoalLabels, type GoalSettings } from "../data/models/goal-types.ts";
import type { UserChanges } from "../data/models/dao-types.ts";

type SessionState =
    | { kind: "loading" }
    | { kind: "onboarding" }
    | { kind: "ready"; session: AppSession }
    | { kind: "error"; message: string };

export function useAppSession() {
    const [state, setState] = useState<SessionState>({
        kind: "loading",
    });

    const [revision, setRevision] = useState(0);

    const reload = useCallback(() => {
        setState({ kind: "loading" });
        setRevision((value) => value + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const session = await loadAppSession();

                if (cancelled) return;

                setState(
                    session
                        ? { kind: "ready", session }
                        : { kind: "onboarding" },
                );
            } catch (reason) {
                if (cancelled) return;

                setState({
                    kind: "error",
                    message:
                        reason instanceof Error
                            ? reason.message
                            : String(reason),
                });
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [revision]);

    const updateUser = useCallback((userId: string, changes: UserChanges) => {
        setState((previous) => {
            if (previous.kind !== "ready" || previous.session.user.id !== userId) return previous;

            const user = {
                ...previous.session.user,
                ...changes,
            };

            return {
                kind: "ready",
                session: {
                    ...previous.session,
                    user,
                    context: {
                        ...previous.session.context,
                        language: user.target_language ?? "French",
                    }
                },
            }
        })
    }, [])

    const updateGoals = useCallback((userId: string, goalSettings: GoalSettings) => {
        setState((previous) => {
            if (previous.kind !== "ready" || previous.session.user.id !== userId) return previous;

            return {
                ...previous,
                session: {
                    ...previous.session,
                    goalSettings,
                    context: {
                        ...previous.session.context,
                        goals: selectedGoalLabels(goalSettings)
                    }
                }
            };
        });
    }, []);

    return {
        state,
        reload,
        updateUser,
        updateGoals,
    };
}