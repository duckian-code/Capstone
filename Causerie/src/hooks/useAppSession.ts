import { useCallback, useEffect, useState } from "react";
import {
    loadAppSession,
    type AppSession,
} from "../services/app-session";

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

    return {
        state,
        reload,
    };
}