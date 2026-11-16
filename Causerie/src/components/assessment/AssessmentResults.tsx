import { useEffect, useState } from "react";
import { assessments, skillName, type AssessmentRecord, type Passage } from "../../services/assessment";
import { parseCommandError } from "../../services/command-error";
import "./assessment.css";
const percent = (n: number) => new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }).format(n);
const date = (s: string) => new Date(s).toLocaleString();
export function PassageText({ passage }: { passage: Passage | null }) {
    return passage && <aside className="assessment-passage" lang={passage.language}>
        <h4>{passage.title}</h4><p>{passage.text}</p>
    </aside>;
}
export function AssessmentResults({ record, compact = false }: { record: AssessmentRecord; compact?: boolean }) {
    const result = record.results;
    return <div className="assessment-results">
        <p><strong>French overall estimate: {result.overall.category ?? "Unavailable"}</strong><br />
            Based on the assessed skills: {record.scoringPolicy.includedSkills.map(skillName).join(", ")}.</p>
        <p>Completed <time dateTime={record.completedAt}>{date(record.completedAt)}</time></p>
        {result.overall.status === "unavailable" && <p>Overall placement is unavailable because at least one assessed skill has no established placement.</p>}
        {!compact && <p>Overall category-rank mean: {result.overall.meanRank?.toFixed(3) ?? "Unavailable"} · Scoring policy: {record.scoringPolicy.version}</p>}
        {record.scoringPolicy.includedSkills.map(skill => {
            const r = result.skills[skill];
            return <section key={skill}>
                <h4>{skillName(skill)}: {r.category ?? "Placement not established"}</h4>
                {!compact && <>
                    <p>Estimated category: {r.category ?? "Placement not established"}</p>
                    {r.progressStatus === "measured" ? <>
                        <p>{r.nextLevel} accuracy: {r.nextLevelCounts!.correct}/{r.nextLevelCounts!.answered} correct ({percent(r.nextLevelAccuracy!)}).</p>
                        <p>Progress toward the {r.nextLevel} placement cutoff: {percent(r.placementProgress!)}.
                            Required correct: {r.requiredCorrect}/{r.nextLevelCounts!.answered}.
                            Display position: {r.displayPosition!.toFixed(2)}.</p>
                    </> : r.progressStatus === "ceiling" ? <p>C1 is the highest assessed level. No next-level progress.</p>
                        : r.progressStatus === "not_assessed" ? <p>{r.nextLevel} accuracy and placement progress: Not assessed.
                            {r.nextLevelCounts ? ` Only ${r.nextLevelCounts.answered} questions answered; ${record.config.minimumEvidence} required.` : " No questions at this level."}</p>
                        : <p>Next-level placement progress: Not assessed because placement is not established.</p>}
                    <table><caption>Evidence across the full assessment</caption><thead><tr><th>Level</th><th>Correct / answered</th><th>Accuracy</th><th>Placement evidence</th></tr></thead>
                        <tbody>{record.config.levels.map(level => {
                            const c = r.evidence[level];
                            return <tr key={level}><th>{level}</th><td>{c ? `${c.correct} / ${c.answered}` : "—"}</td>
                                <td>{c && c.answered ? percent(c.correct / c.answered) : "Not assessed"}</td>
                                <td>{!c || c.answered < record.config.minimumEvidence ? "Insufficient evidence" :
                                    c.correct >= Math.ceil(record.config.placementThreshold * c.answered) ? "Meets original cutoff" : "Below original cutoff"}</td></tr>;
                        })}</tbody>
                    </table>
                </>}
            </section>;
        })}
        {!compact && <>
            <p>Placement progress measures proximity to this test’s placement threshold. It is not the percentage of language proficiency mastered.</p>
            <p>This assessment uses draft questions and provides an estimate, not a certified CEFR result. Your conversation proficiency setting is unchanged.</p>
            <h3>Questions and answers</h3>
            {record.blocks.map(block => <section key={block.index}>
                <h4>Block {block.index + 1}</h4>
                {block.items.map((item, index) => <details key={item.question.id}>
                    <summary>{index + 1}. {skillName(item.skill)} · {item.administeredDifficulty} · {item.correct ? "Correct" : "Incorrect"}</summary>
                    <PassageText passage={item.passage} />
                    <p className="assessment-question" lang={record.language}>{item.question.prompt}</p>
                    <ol>{item.displayedOptionOrder.map(id => <li key={id} lang={record.language}>
                        {item.question.options.find(o => o.id === id)?.text}
                        {id === item.submittedOptionId && <strong> — Your answer</strong>}
                        {id === item.question.correctOptionId && <strong> — Correct answer</strong>}
                    </li>)}</ol>
                    <p lang={record.language}>{item.question.explanation}</p>
                    <small>Question {item.question.id} v{item.question.version}; bank {item.bankId} v{item.bankVersion}
                        {item.passage && `; passage ${item.passage.id} v${item.passage.version}`}</small>
                </details>)}
            </section>)}
        </>}
    </div>;
}
export function AssessmentHistory({ userId, revision, compact = false, onStart }: {
    userId: string; revision: number; compact?: boolean; onStart: () => void;
}) {
    const [records, setRecords] = useState<AssessmentRecord[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let alive = true; setRecords(null); setError(null);
        assessments.list(userId).then(rows => { if (alive) setRecords(rows); })
            .catch(e => { if (alive) setError(parseCommandError(e).message); });
        return () => { alive = false; };
    }, [userId, revision, retry]);
    return <div className="assessment-history">
        <button type="button" onClick={onStart}>Take French proficiency test</button>
        {error ? <p role="alert">{error} <button type="button" onClick={() => setRetry(n => n+1)}>Retry loading assessments</button></p>
            : records === null ? <p role="status">Loading French assessments…</p>
            : records.length === 0 ? <p>No French assessment completed yet.</p>
            : compact ? <AssessmentResults record={records[0]} compact />
            : records.map(record => <details key={record.id}>
                <summary>{date(record.completedAt)} — Overall estimate: {record.results.overall.category ?? "Unavailable"}</summary>
                <AssessmentResults record={record} />
            </details>)}
    </div>;
}
