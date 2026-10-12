
import { createMachine } from "xstate";

export const mascotMachine = createMachine({
    id: "mascot",
    initial: "idle",

    states: {
        idle: {
            on: {
                MAKE_HAPPY: "happy",
            },
        },

        happy: {
            after: {
                2000: "idle",
            },
            on: {
                MAKE_IDLE: "idle",
            },
        },
    },
});
