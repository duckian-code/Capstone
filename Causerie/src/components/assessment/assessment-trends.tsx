import type { AssessmentRecord } from "../../services/assessment";

export const TREND_SKILLS = ["reading", "vocabulary", "grammar"] as const;
export type TrendSkill = typeof TREND_SKILLS[number];
export type TrendSeries = TrendSkill | "overall";
export const TREND_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export interface TrendPoint {
    recordId: string;
    time: number;
    markerValue: number | null;
    lineValue: number | null;
    hollow: boolean;
}

export function chronologicalAssessments(records: AssessmentRecord[], userId: string): AssessmentRecord[] {
    // Also protect the view from a stale response for a different profile.
    return records.filter(r => r.userId === userId && r.language === "fr" && r.status === "completed"
        && Number.isFinite(Date.parse(r.completedAt)))
        .slice().sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt) || a.id.localeCompare(b.id));
}
export function recordsInYear(records: AssessmentRecord[], year: number): AssessmentRecord[] {
    // Same local calendar used by the existing completion-date display.
    return records.filter(r => new Date(r.completedAt).getFullYear() === year);
}
function localMonthStart(year: number, month: number): number {
    const date = new Date(0);
    date.setFullYear(year, month, 1);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}
export function yearDomain(year: number): { start: number; end: number } {
    return { start: localMonthStart(year, 0), end: localMonthStart(year + 1, 0) };
}
export function monthTicks(year: number): { label: string; time: number }[] {
    return MONTH_LABELS.map((label, month) => ({ label, time: localMonthStart(year, month) }));
}
export function positionInYear(time: number, year: number): number {
    const { start, end } = yearDomain(year);
    return (time - start) / (end - start);
}
function validPosition(value: number | null | undefined): value is number {
    return typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 5;
}
export function trendPoint(record: AssessmentRecord, series: TrendSeries): TrendPoint {
    const point: TrendPoint = { recordId: record.id, time: Date.parse(record.completedAt), markerValue: null, lineValue: null, hollow: false };
    if (series === "overall") {
        const overall = record.results.overall;
        if (overall.status === "available" && validPosition(overall.meanRank)) {
            point.markerValue = overall.meanRank;
            point.lineValue = overall.meanRank;
        }
        return point;
    }
    const skill = record.results.skills[series];
    if (!skill || skill.placementStatus !== "established" || skill.category === null || !validPosition(skill.rank)) return point;
    if (skill.progressStatus === "not_assessed") {
        point.markerValue = skill.rank;
        point.hollow = true;
    } else if ((skill.progressStatus === "measured" || skill.progressStatus === "ceiling") && validPosition(skill.displayPosition)) {
        point.markerValue = skill.displayPosition;
        point.lineValue = skill.displayPosition;
    }
    return point;
}
export function lineSegments(points: TrendPoint[]): TrendPoint[][] {
    const segments: TrendPoint[][] = [];
    let segment: TrendPoint[] = [];
    const flush = () => { if (segment.length > 1) segments.push(segment); segment = []; };
    for (const point of points) {
        if (point.lineValue === null) flush(); else segment.push(point);
    }
    flush();
    return segments;
}