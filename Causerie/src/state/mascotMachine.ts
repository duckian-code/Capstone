import { setup } from "xstate";
import type { SnapshotFrom } from "xstate";

export type MascotEvent =
    | { type: "SUBMIT" }
    | { type: "RESPONSE_STARTED" }
    | { type: "STREAM_DONE" }
    | { type: "REQUEST_FAILED" }
    | { type: "REQUEST_CANCELLED" };

// TODO: either implement concurrent mascot states between threads or cancel and rollback active requests on thread change
export const mascotMachine = setup({
    types: {
        events: {} as MascotEvent
    }
}).createMachine({
    id: "mascot",
    initial: "idle",

    states: {
        idle: {
            on: { SUBMIT: "wait" },
        },

        wait: {
            on: {
                RESPONSE_STARTED: "respond",
                STREAM_DONE: "idle",
                REQUEST_FAILED: "error",
                REQUEST_CANCELLED: "idle" },
        },

        respond: {
            on: { STREAM_DONE: "idle", REQUEST_FAILED: "error", REQUEST_CANCELLED: "idle" },
        },

        error: {
            after: { 5000: "idle" }, // after 5 seconds of displaying error, return to idle
            on: { SUBMIT: "wait", REQUEST_CANCELLED: "idle" },
        },
    },
});

export type MascotState = SnapshotFrom<typeof mascotMachine>["value"];