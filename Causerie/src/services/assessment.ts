import { callBackend } from "../data/dao/base";
export type AssessmentLevel = "A1" | "A2" | "B1" | "B2" | "C1";
export interface AssessmentConfig {
    blocks: number; questionsPerSkill: number; startingLevel: AssessmentLevel;
    decreaseBelow: number; increaseAt: number; minimumEvidence: number;
    placementThreshold: number; levels: AssessmentLevel[];
}
export interface ScoringPolicy { version: string; includedSkills: string[]; overallMethod: string }
export interface Counts { correct: number; answered: number }
export interface SkillResult {
    category: AssessmentLevel | null; rank: number | null;
    placementStatus: "established" | "not_established";
    evidence: Partial<Record<AssessmentLevel, Counts>>;
    nextLevel: AssessmentLevel | null; nextLevelCounts: Counts | null;
    nextLevelAccuracy: number | null; requiredCorrect: number | null;
    progressStatus: "measured" | "not_assessed" | "ceiling" | "placement_not_established";
    placementProgress: number | null; displayPosition: number | null;
}
export interface OptionItem { id: string; text: string }
export interface Passage { id: string; version: number; language: string; level: AssessmentLevel; title: string; genre: string; text: string }
export interface Question {
    id: string; version: number; language: string; skill: string; level: AssessmentLevel;
    format: string; status: string; prompt: string; passageId: string | null;
    passageVersion: number | null; options: OptionItem[]; correctOptionId: string;
    explanation: string; tags: string[];
}
export interface AssessmentRecord {
    schemaVersion: number; id: string; userId: string; language: string; status: "completed";
    startedAt: string; completedAt: string; config: AssessmentConfig; scoringPolicy: ScoringPolicy;
    banks: { bankId: string; bankVersion: number; skill: string }[];
    blocks: { index: number; shownAt: string; submittedAt: string; items: {
        bankId: string; bankVersion: number; skill: string; administeredDifficulty: AssessmentLevel;
        question: Question; passage: Passage | null; displayedOptionOrder: string[];
        submittedOptionId: string; correct: boolean;
    }[] }[];
    results: { skills: Record<string, SkillResult>; overall: {
        status: "available" | "unavailable"; meanRank: number | null; category: AssessmentLevel | null;
    } };
}
export interface ActiveAssessment {
    id: string; userId: string; language: string; status: "in_progress";
    config: AssessmentConfig; scoringPolicy: ScoringPolicy;
    block: { index: number; items: { id: string; skill: string; prompt: string; passage: Passage | null; options: OptionItem[] }[] };
}
export type AssessmentResponse = ActiveAssessment | AssessmentRecord;
export const skillName = (skill: string) => ({ reading: "Reading comprehension", vocabulary: "Vocabulary", grammar: "Grammar" }[skill] ?? skill);
export const assessments = {
    info: () => callBackend<{ language: string; config: AssessmentConfig; scoringPolicy: ScoringPolicy }>("french_assessment_info"),
    start: (userId: string, attemptId: string) => callBackend<AssessmentResponse>("start_french_assessment", { userId, attemptId }),
    submit: (userId: string, attemptId: string, blockIndex: number, answers: Record<string, string>) =>
        callBackend<AssessmentResponse>("submit_assessment_block", { userId, attemptId, blockIndex, answers }),
    cancel: (userId: string, attemptId: string) => callBackend<void>("cancel_assessment", { userId, attemptId }),
    list: (userId: string, language = "fr") => callBackend<AssessmentRecord[]>("list_assessments", { userId, language }),
};
