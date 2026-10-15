import { mascotMachine, type MascotState, type MascotEvent
} from "../state/mascotMachine.ts";
import {useCallback, useEffect, useRef, useState} from "react";
import { createActor} from "xstate";
import type { ActorRefFrom } from "xstate";

// CALL THIS HOOK ONCE FOR THE ACTIVE CONVERSATION SCREEN
export function useMascot() {
    const actorRef = useRef<ActorRefFrom<typeof mascotMachine> | null>(null);

    const [state, setState] = useState<MascotState>("idle");

    useEffect(() => {
        const actor = createActor(mascotMachine);

        actorRef.current = actor;

        const subscription = actor.subscribe((snapshot) => {
            // const state = snapshot.value as keyof typeof textures;
            // mascot.texture =
            //     textures[state] ?? idleTexture;
            setState(snapshot.value);
        });

        actor.start();

        return () => {
            subscription.unsubscribe();
            actor.stop();

            if (actorRef.current === actor) {
                actorRef.current = null;
            }
        };
    }, []);

    const send = useCallback((ev: MascotEvent) => actorRef.current?.send(ev), []);

    return { state, send };
}