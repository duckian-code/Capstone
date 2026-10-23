import type { MessageCorrection } from "./dao-types";

export interface TeacherFeedback {
    summary: string;
    corrections: MessageCorrection[];
}

export type TeacherResult =
    | {
    status: "ready";
    feedback: TeacherFeedback;
}
    | {
    status: "unavailable";
    message: string;
};
