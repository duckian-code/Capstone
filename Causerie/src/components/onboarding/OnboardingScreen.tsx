import { parseCommandError } from '../../services/command-error';
import { useEffect, useState } from "react";
import type { User } from "../../data/models/dao-types";
import { dal } from "../../data/dal";
import { credentials } from "../../services/credentials";
import { completeOnboarding } from "../../services/onboarding";
import { initializeTutorial } from "../../services/tutorial";
import { assessments, type AssessmentRecord } from "../../services/assessment";
import { suggestedLevel, assessmentDistribution } from "../../services/onboarding-assessment";
import { proficiency, PROFICIENCY_LEVELS, type ProficiencyLevel } from "../../services/proficiency";
import { AssessmentDialog } from "../assessment/AssessmentDialog";
import { OnboardingForm } from "./OnboardingForm";
import "./onboarding.css";

const DESCRIPTIONS: Record<ProficiencyLevel, string> = {
    A1: "I can use basic words and introduce myself.", A2: "I can manage simple everyday exchanges.",
    B1: "I can discuss familiar topics and explain experiences.", B2: "I can discuss varied topics and explain my views.",
    C1: "I can express complex ideas fluently.", C2: "I can express subtle meanings with ease.",
};
export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
    const [user, setUser] = useState<User | null>(null);
    const [needKey, setNeedKey] = useState(false);
    const [replacementKey, setReplacementKey] = useState('');
    const [keySaved, setKeySaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [level, setLevel] = useState<ProficiencyLevel | "">("");
    const [record, setRecord] = useState<AssessmentRecord | null>(null);
    const [testing, setTesting] = useState(false);
    const [busy, setBusy] = useState(false);
    const [revision, setRevision] = useState(0);
    const [resultsRevision, setResultsRevision] = useState(0);
    const [distribution, setDistribution] = useState(false);
    useEffect(() => {
        let alive = true;
        setLoading(true); setError(null);
        void (async () => {
            const state = await dal.appState.get();
            const saved = await credentials.hasApiKey();
            const profile = state ? await dal.users.get(state.active_user_id) : null;
            if (alive) { setKeySaved(saved); setUser(profile); setNeedKey(!!profile && !saved); }
        })().catch(e => { if (alive) setError(parseCommandError(e).message); }).finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [revision]);
    useEffect(() => {
        if (!user || needKey) return;
        function savedChoice(): ProficiencyLevel | '' {
            try { const value = localStorage.getItem(`causerie:essentials-level:${user!.id}`); return PROFICIENCY_LEVELS.includes(value as ProficiencyLevel) ? value as ProficiencyLevel : ''; } catch { return ''; }
        }
        setLevel(savedChoice());
        if (user.target_language !== 'French') return;
        let alive = true;
        void assessments.list(user.id).then(records => {
            if (!alive || !records[0]) return;
            const result = records[0]; setRecord(result);
            const suggestion = suggestedLevel(result);
            setLevel(savedChoice() || suggestion || ''); setDistribution(!suggestion);
        }).catch(e => { if (alive) setError(parseCommandError(e).message); });
        return () => { alive = false; };
    }, [user, needKey, resultsRevision]);
    function chooseLevel(value: ProficiencyLevel) {
        setLevel(value);
        try { if (user) localStorage.setItem(`causerie:essentials-level:${user.id}`, value); } catch { setError("Your selection could not be saved for restart. Confirm it before closing setup."); }
    }
    async function finish() {
        if (!user || !level || busy) return;
        setBusy(true); setError(null);
        try {
            await proficiency.save(user.id, level);
            await initializeTutorial(user.id);
            await dal.appState.completeOnboarding(user.id);
            try { localStorage.removeItem('causerie:essentials-draft:v1'); } catch { /* Saved essentials remain authoritative. */ }
            onComplete();
        } catch (e) { setError(parseCommandError(e).message); }
        finally { setBusy(false); }
    }
    return <main className="onboarding"><section className="onboarding-card" aria-labelledby="onboarding-title">
        <h1 id="onboarding-title">{user ? 'Choose your starting level' : 'Welcome to Causerie'}</h1>
        {loading ? <p role="status">Loading setup…</p> : needKey ? <form onSubmit={async event => {
            event.preventDefault(); if (busy) return; setBusy(true); setError(null);
            try { await credentials.saveApiKey(replacementKey.trim()); setReplacementKey(''); const current = await dal.appState.get(); if (current?.onboarding_completed_at) onComplete(); else { setNeedKey(false); setKeySaved(true); } }
            catch (e) { setError(parseCommandError(e).message); }
            finally { setBusy(false); }
        }}><p>Your profile is saved. Restore your API key to continue.</p><label>OpenAI API key<input type="password" autoComplete="off" required value={replacementKey} onChange={e => setReplacementKey(e.target.value)} /></label><button disabled={busy}>Save key</button></form> : !user ? <>
            <p>Set up your learning profile. Your profile picture is optional.</p>
            <OnboardingForm keySaved={keySaved} onSubmit={async input => { const saved = await completeOnboarding(input); setUser(saved); setError(saved.avatarWarning ?? null); }} />
        </> : <>
            <p>Choose your own level, or take a test to help you decide. You can adjust this later.</p>
            <fieldset disabled={busy}><legend>Choose my level</legend>
                {PROFICIENCY_LEVELS.map(value => <label key={value} className="onboarding-level"><input type="radio" name="proficiency" value={value} checked={level === value} onChange={() => chooseLevel(value)} /> <strong>{value}</strong> — {DESCRIPTIONS[value]}</label>)}
            </fieldset>
            <button disabled={busy || user.target_language !== 'French'} onClick={() => setTesting(true)}>Help me find my level</button>
            {user.target_language !== 'French' ? <p>Assessment currently available for French; other languages are not yet implemented.</p> : <p>Plan for approximately 15–30 minutes; adaptive follow-up questions can take longer. You can review the question count before starting.</p>}
            {record && <section aria-label="Assessment recommendation">
                <p>{suggestedLevel(record) ? `Suggested conversation level: ${suggestedLevel(record)}. Based on the skills with established placements; you can adjust it above.` : 'No placement could be established. Review the results and choose a starting level above.'}</p>
                <p>The original assessment is saved in your history.</p>
                <button onClick={() => setDistribution(value => !value)} aria-expanded={distribution}>Score distribution</button>
                {distribution && <><p>Counts describe the questions assessed, not a placement at each level.</p><table><thead><tr><th>Level</th><th>Questions</th><th>Correct</th><th>Incorrect</th></tr></thead><tbody>
                {assessmentDistribution(record).map(row => <tr key={row.level}><th>{row.level}</th><td>{row.total || 'Not assessed'}</td><td>{row.total ? row.correct : '—'}</td><td>{row.total ? row.incorrect : '—'}</td></tr>)}
                </tbody></table></>}
            </section>}
            <button disabled={!level || busy} onClick={() => void finish()}>{busy ? 'Saving…' : 'Confirm level and meet Dot'}</button>
        </>}
        {error && <div role="alert"><p>{error}</p><button onClick={() => { setRevision(n => n+1); setResultsRevision(n => n+1); }}>Retry loading</button></div>}
        {testing && user && <AssessmentDialog userId={user.id} onClose={() => setTesting(false)} onCompleted={() => setResultsRevision(n => n+1)} />}
    </section></main>;
}