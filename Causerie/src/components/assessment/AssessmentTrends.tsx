import { useEffect, useId, useState } from "react";
import { assessments, skillName, type AssessmentRecord, type SkillResult } from "../../services/assessment";
import { parseCommandError } from "../../services/command-error";
import { AssessmentResults } from "./AssessmentResults";
import { chronologicalAssessments, recordsInYear, monthTicks, positionInYear, trendPoint, lineSegments,
    TREND_LEVELS, TREND_SKILLS, type TrendSeries, type TrendSkill } from "./assessment-trends";
import "./assessment.css";

const NAMES: Record<TrendSeries, string> = { reading: "Reading comprehension", vocabulary: "Vocabulary", grammar: "Grammar", overall: "Overall mean category rank" };
const COLORS: Record<TrendSeries, string> = { reading: "#80d5c5", vocabulary: "#e8bf74", grammar: "#baa5f5", overall: "#f2f3f5" };
const ALL_SERIES: TrendSeries[] = [...TREND_SKILLS, "overall"];
const percent = (n: number) => new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }).format(n);
const dateText = (s: string) => new Date(s).toLocaleString();
function describe(record: AssessmentRecord, series: TrendSeries): string {
    if (series === "overall") {
        const r = record.results.overall;
        return r.status === "available" && r.meanRank !== null
            ? `Overall estimated category ${r.category}; mean category rank ${r.meanRank.toFixed(2)}` : "Overall placement unavailable";
    }
    const r = record.results.skills[series];
    if (!r || r.category === null) return `${NAMES[series]}: Placement not established`;
    const category = `${NAMES[series]}: estimated ${r.category}`;
    if (r.progressStatus === "measured" && r.nextLevelCounts && r.nextLevelAccuracy !== null && r.placementProgress !== null) {
        return `${category}; ${r.nextLevel}: ${r.nextLevelCounts.correct}/${r.nextLevelCounts.answered} correct (${percent(r.nextLevelAccuracy)} accuracy); ${percent(r.placementProgress)} toward the next placement cutoff`;
    }
    return `${category}; ${r.progressStatus === "ceiling" ? "C1 ceiling; no next-level progress" : "next-level progress: Not assessed"}`;
}
function Marker({ series, x, y, hollow }: { series: TrendSeries; x: number; y: number; hollow: boolean }) {
    const attrs = { fill: hollow ? "#22262d" : COLORS[series], stroke: hollow ? COLORS[series] : "#22262d", strokeWidth: hollow ? 2 : 1.2 };
    if (series === "grammar") return <rect {...attrs} x={x - 5} y={y - 5} width={10} height={10} />;
    if (series === "vocabulary") return <path {...attrs} d={`M ${x} ${y-7} L ${x+7} ${y} L ${x} ${y+7} L ${x-7} ${y} Z`} />;
    return <circle {...attrs} cx={x} cy={y} r={series === "overall" ? 3.5 : 5.5} />;
}
function SkillEvidence({ skill, record }: { skill: TrendSkill; record: AssessmentRecord }) {
    const r: SkillResult | undefined = record.results.skills[skill];
    return <div className="assessment-trend-evidence" aria-live="polite">
        <h4>{skillName(skill)} · Estimated category: {r?.category ?? "Placement not established"}</h4>
        {!r ? <p>This skill was not included in this assessment.</p>
            : r.progressStatus === "measured" && r.nextLevelCounts && r.placementProgress !== null && r.nextLevelAccuracy !== null ? <>
                <p>{r.nextLevel} accuracy: {r.nextLevelCounts.correct}/{r.nextLevelCounts.answered} correct ({percent(r.nextLevelAccuracy)}).</p>
                <p>Placement cutoff: {r.requiredCorrect}/{r.nextLevelCounts.answered} correct.
                    Progress toward that cutoff: {percent(r.placementProgress)}.</p>
                <progress aria-label={`${skillName(skill)} progress toward the ${r.nextLevel} placement cutoff`} max={1} value={r.placementProgress} />
                <p>Fractional display position: {r.displayPosition?.toFixed(2)}.</p>
            </> : r.progressStatus === "ceiling" ? <p>C1 is the highest assessed level. There is no next-level progress.</p>
                : r.category ? <p>{r.nextLevel} accuracy and placement progress: Not assessed.
                        {r.nextLevelCounts ? ` Only ${r.nextLevelCounts.answered} questions answered; ${record.config.minimumEvidence} required.` : " No next-level questions were answered."}</p>
                    : <p>No tested level established placement. Next-level placement progress: Not assessed.</p>}
        {r && <p>Recorded evidence: {record.config.levels.filter(level => r.evidence[level]).map(level => {
            const c = r.evidence[level]!; return `${level}: ${c.correct}/${c.answered} correct`;
        }).join("; ") || "No answered questions"}.</p>}
        {record.exhaustedSkills?.includes(skill) && <p>The follow-up question pool was exhausted without establishing placement.</p>}
    </div>;
}

export function AssessmentTimeline({ records }: { records: AssessmentRecord[] }) {
    const latest = records[records.length - 1];
    const [year, setYear] = useState(() => latest ? new Date(latest.completedAt).getFullYear() : new Date().getFullYear());
    const [series, setSeries] = useState<"all" | TrendSeries>("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detailSkill, setDetailSkill] = useState<TrendSkill>("reading");
    const id = useId();
    const rows = recordsInYear(records, year);
    const selected = rows.find(r => r.id === selectedId) ?? rows[rows.length - 1];
    const visible = series === "all" ? ALL_SERIES : [series];
    const width = 760, height = 300, left = 48, right = 22, top = 24, bottom = 40;
    const x = (time: number) => left + positionInYear(time, year) * (width - left - right);
    const y = (value: number) => top + (5 - value) / 4 * (height - top - bottom);
    function navigate(delta: number) { setYear(previous => previous + delta); setSelectedId(null); }
    function select(record: AssessmentRecord, key: TrendSeries) { setSelectedId(record.id); if (key !== "overall") setDetailSkill(key); }
    return <div className="assessment-trends">
        <div className="assessment-trend-year" aria-label="Assessment year navigation">
            <button type="button" aria-label="Previous assessment year" disabled={year <= 1} onClick={() => navigate(-1)}>←</button>
            <strong aria-live="polite">{year}</strong>
            <button type="button" aria-label="Next assessment year" disabled={year >= 9999} onClick={() => navigate(1)}>→</button>
        </div>
        <div className="assessment-trend-controls">
            <label>Show series<select value={series} onChange={event => setSeries(event.currentTarget.value as "all" | TrendSeries)}>
                <option value="all">All skills and overall</option>
                {ALL_SERIES.map(key => <option key={key} value={key}>{NAMES[key]}</option>)}
            </select></label>
            <label>Assessment<select disabled={!selected} value={selected?.id ?? ""} onChange={event => setSelectedId(event.currentTarget.value)}>
                {!selected && <option value="">No assessments in {year}</option>}
                {rows.slice().reverse().map((record, index) => <option key={record.id} value={record.id}>{dateText(record.completedAt)} · #{rows.length - index}</option>)}
            </select></label>
        </div>
        <div className="assessment-trend-legend" aria-label="Graph legend">
            {visible.map(key => <span key={key}>
                <svg viewBox="0 0 28 18" width="28" height="18" aria-hidden="true">
                    <line x1={0} x2={28} y1={9} y2={9} stroke={COLORS[key]} strokeWidth={2} strokeDasharray={key === "overall" ? "5 4" : undefined} />
                    <Marker series={key} x={14} y={9} hollow={false} />
                </svg>{NAMES[key]}
            </span>)}
        </div>
        <p id={`${id}-instructions`} className="settings-help">Select a marker or choose an assessment above. On narrow windows, scroll the graph horizontally to see all twelve months.</p>
        <div className="assessment-trend-scroll" tabIndex={0} role="region" aria-label={`French assessment graph for ${year}`} aria-describedby={`${id}-instructions`}>
            <svg className="assessment-trend-chart" viewBox={`0 0 ${width} ${height}`} role="group" aria-labelledby={`${id}-title ${id}-description`}>
                <title id={`${id}-title`}>French proficiency history, January–December {year}</title>
                <desc id={`${id}-description`}>Skill markers use the saved category rank plus measured placement progress. Hollow markers show the category only and break the line. The dashed overall line uses the saved equal mean of skill-category ranks.</desc>
                {TREND_LEVELS.map((level, index) => <g key={level}>
                    <line x1={left} x2={width-right} y1={y(index+1)} y2={y(index+1)} className="assessment-trend-grid" />
                    <text x={left-12} y={y(index+1)+4} textAnchor="end">{level}</text>
                </g>)}
                {monthTicks(year).map(tick => <g key={tick.label}>
                    <line x1={x(tick.time)} x2={x(tick.time)} y1={top} y2={height-bottom} className="assessment-trend-grid assessment-trend-month-line" />
                    <text x={x(tick.time)} y={height-15} textAnchor="middle">{tick.label}</text>
                </g>)}
                {selected && <line x1={x(Date.parse(selected.completedAt))} x2={x(Date.parse(selected.completedAt))} y1={top-10} y2={height-bottom} className="assessment-trend-selected-date" />}
                {visible.map(key => <g key={`line-${key}`} aria-hidden="true">
                    {lineSegments(rows.map(r => trendPoint(r, key))).map((segment, index) => <polyline key={index}
                                                                                                       points={segment.map(p => `${x(p.time)},${y(p.lineValue!)}`).join(" ")} fill="none" stroke={COLORS[key]}
                                                                                                       strokeWidth={key === "overall" ? 1.8 : 2} strokeDasharray={key === "overall" ? "5 5" : undefined} />)}
                </g>)}
                {rows.flatMap(record => visible.map(key => {
                    const point = trendPoint(record, key);
                    if (point.markerValue === null) return null;
                    const tooltip = `${dateText(record.completedAt)} · ${describe(record, key)}`;
                    return <g key={`${record.id}-${key}`} className="assessment-trend-marker" role="button" tabIndex={0}
                              aria-label={tooltip} aria-pressed={selected?.id === record.id} data-series={key} data-hollow={point.hollow}
                              onClick={() => select(record, key)} onKeyDown={event => {
                        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(record, key); }
                    }}>
                        <title>{tooltip}</title>
                        <circle cx={x(point.time)} cy={y(point.markerValue)} r={12} fill="transparent" className="assessment-trend-hit" />
                        <Marker series={key} x={x(point.time)} y={y(point.markerValue)} hollow={point.hollow} />
                    </g>;
                }))}
            </svg>
        </div>
        {!rows.length && <p role="status">No completed French assessments in {year}. Use the arrows to view another year.</p>}
        <p className="settings-help">Filled skill markers show measured placement progress or the C1 ceiling. Hollow markers show an established category with next-level progress “Not assessed”; the line breaks there. Observed zero progress is a filled marker. Unestablished placements have no marker.</p>
        <p className="settings-help">The dashed overall line is the saved equal mean of skill-category ranks, not an average of fractional skill positions. Its rounded category is shown in the selected result. It can remain available when next-level progress is not assessed.</p>
        <p className="settings-help">Placement progress measures proximity to this test’s placement cutoff, not the percentage of language proficiency mastered. C2 is not assessed.</p>
        {selected && <div className="assessment-trend-selected">
            <h4>Selected assessment · <time dateTime={selected.completedAt}>{dateText(selected.completedAt)}</time></h4>
            <p aria-live="polite">{describe(selected, "overall")}.</p>
            <p className="settings-help">Scoring policy: {selected.scoringPolicy.version}. Assessed skills: {selected.scoringPolicy.includedSkills.map(skillName).join(", ")}.</p>
            <label>Detail skill<select value={detailSkill} onChange={event => setDetailSkill(event.currentTarget.value as TrendSkill)}>
                {TREND_SKILLS.map(skill => <option key={skill} value={skill}>{skillName(skill)}</option>)}
            </select></label>
            <SkillEvidence skill={detailSkill} record={selected} />
            <details key={selected.id}>
                <summary>Review this assessment’s results, questions, and answers</summary>
                <AssessmentResults record={selected} />
            </details>
        </div>}
    </div>;
}

export function ProfileAssessmentHistory({ userId, revision, onStart }: {
    userId: string;
    revision: number;
    onStart: () => void;
}) {
    const [records, setRecords] = useState<AssessmentRecord[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let alive = true;
        setRecords(null);
        setError(null);

        assessments.list(userId)
            .then(rows => {
                if (alive) {
                    setRecords(chronologicalAssessments(rows, userId));
                }
            })
            .catch(reason => {
                if (alive) setError(parseCommandError(reason).message);
            });

        return () => {
            alive = false;
        };
    }, [userId, revision, retry]);

    const latest = records?.[records.length - 1];
    const overallLevel = latest?.results.overall.status === "available"
        ? latest.results.overall.category
        : null;

    return (
        <div className="profile-proficiency">
            {error ? (
                <div className="profile-proficiency-message" role="alert">
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={() => setRetry(value => value + 1)}>
                        Retry loading assessments
                    </button>
                </div>
            ) : records === null ? (
                <p className="profile-proficiency-message" role="status">
                    Loading proficiency…
                </p>
            ) : latest ? (
                <>
                    <div className="profile-proficiency-card">
                        <p className="profile-proficiency-eyebrow">
                            Latest Assessment
                        </p>

                        <dl className="profile-proficiency-overall">
                            <dt>Overall Proficiency</dt>
                            <dd
                                className={
                                    overallLevel
                                        ? undefined
                                        : "profile-proficiency-unavailable"
                                }>
                                {overallLevel ?? "Not established"}
                            </dd>
                        </dl>

                        <dl className="profile-proficiency-skills">
                            {TREND_SKILLS.map(skill => {
                                const result = latest.results.skills[skill];
                                const level =
                                    result?.placementStatus === "established"
                                        ? result.category
                                        : null;

                                return (
                                    <div key={skill}>
                                        <dt>{skillName(skill)}</dt>
                                        <dd
                                            className={
                                                level
                                                    ? undefined
                                                    : "profile-proficiency-unavailable"
                                            }>
                                            {level ?? (
                                                result
                                                    ? "Not established"
                                                    : "Not assessed"
                                            )}
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>

                        <p className="profile-proficiency-date">
                            Assessed{" "}
                            <time dateTime={latest.completedAt}>
                                {new Date(latest.completedAt).toLocaleDateString(
                                    undefined,
                                    {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    },
                                )}
                            </time>
                        </p>

                        <p className="profile-proficiency-caption">
                            Estimated levels from your latest completed test.
                        </p>
                    </div>

                    <div className="profile-proficiency-actions">
                        <button
                            type="button"
                            className="profile-proficiency-start"
                            onClick={onStart}>
                            Take another assessment
                        </button>
                    </div>

                    <details
                        className="profile-proficiency-advanced"
                        key={latest.id}>
                        <summary>Advanced proficiency info</summary>

                        <div className="profile-proficiency-advanced-content">
                            <p className="profile-proficiency-advanced-intro">
                                Explore your assessment history, progress,
                                scoring details, and previous answers.
                            </p>

                            <AssessmentTimeline records={records} />
                        </div>
                    </details>
                </>
            ) : (
                <div className="profile-proficiency-empty">
                    <h4>Discover your starting point</h4>
                    <p>
                        Complete an assessment to see your overall level
                        and your reading, vocabulary, and grammar levels here.
                    </p>
                    <button
                        type="button"
                        className="profile-proficiency-start"
                        onClick={onStart}>
                        Take Proficiency Test
                    </button>
                </div>
            )}
        </div>
    );
}