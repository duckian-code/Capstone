import { useEffect, useState } from 'react';
import type { ConversationMessage } from '../../data/models/conversation-types';
import { eligible, LABELS, LESSONS, nextLesson, type Lesson } from '../../services/tutorial-model';
import { tutorial, tutorialAction } from '../../services/tutorial';
import { useTutorial } from './TutorialProvider';
import { useSettings } from '../settings/SettingsMenus';
import { TutorialPractice } from './TutorialPractice';
import { dal } from '../../data/dal';
import { reminders } from '../../services/reminders';

const COPY: Record<Lesson, string> = {
    translation: 'Select one word in Dot’s message and choose Translate to see its meaning.',
    hint: 'Select a phrase in a message and choose Get hint for a clue about its meaning.',
    teacher: 'Ask Dot a question when you want help composing your reply.',
    sticky: 'Attach your own note to a useful phrase or a correction you want to remember.',
    goals: 'Choose what you would like to work on. You can change your goals later.',
    reminders: 'Choose an optional practice schedule. Notifications require your permission.',
    spelling: 'Use Check spelling on your draft. A result with no mistakes counts too.',
    profile: 'Update your name, pronouns, and profile picture.',
    settings: 'Adjust your language, goals, reminders, and application preferences.',
    voice: 'Explore Text and Voice formats in New thread. You do not need to create a thread or use a microphone.',
};
export function TutorialPanel({ messages, threadId, voice, busy, onCreateThread }: {
    messages: ConversationMessage[]; threadId: string; voice: boolean; busy: boolean; onCreateThread: () => void;
}) {
    const store = useTutorial();
    const settings = useSettings();
    const [quiet, setQuiet] = useState(false);
    const [manual, setManual] = useState(false);
    const [discovery, setDiscovery] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [practice, setPractice] = useState<{ lesson: 'translation' | 'hint' | 'sticky'; message: ConversationMessage; text?: string } | null>(null);
    const [correction, setCorrection] = useState<{ message: ConversationMessage; text: string } | null>(null);
    const firstUser = messages.find(m => m.role === 'user' && (!store.state?.firstUserMessageId || m.id === store.state.firstUserMessageId));
    const state = store.state;
    const next = state ? nextLesson(state) : undefined;
    useEffect(() => {
        const request = () => { setManual(true); setCollapsed(false); };
        window.addEventListener('causerie:tutorial-request', request);
        return () => window.removeEventListener('causerie:tutorial-request', request);
    }, []);
    useEffect(() => { setManual(false); }, [next]);
    useEffect(() => { setPractice(null); setCorrection(null); }, [threadId]);
    useEffect(() => {
        setCorrection(null);
        if (!firstUser || next !== 'sticky') return;
        let alive = true;
        // Existing feedback service reuses its in-flight request; never block the lesson on it.
        void dal.feedback.forMessage(threadId, firstUser.id).then(result => {
            const item = result.status === 'ready' ? result.feedback.corrections[0] : null;
            if (alive && item?.original_text && firstUser.content.includes(item.original_text)) setCorrection({ message: firstUser, text: item.original_text });
        }).catch(() => { /* A useful phrase remains available when feedback is unavailable. */ });
        return () => { alive = false; };
    }, [threadId, firstUser?.id, next]);
    useEffect(() => {
        let lastInput = 0;
        const typing = () => { lastInput = Date.now(); setQuiet(false); };
        const check = () => {
            const selected = window.getSelection();
            const focused = document.activeElement;
            const editing = focused instanceof HTMLElement && focused.matches('input,textarea,[contenteditable="true"]');
            const panel = document.querySelector('dialog[open], details[open]');
            setQuiet(!busy && !tutorial.busy && !editing && !panel && (!selected || selected.isCollapsed) && Date.now() - lastInput > 1200);
        };
        document.addEventListener('input', typing, true);
        const timer = window.setInterval(check, 250); check();
        return () => { clearInterval(timer); document.removeEventListener('input', typing, true); };
    }, [busy]);
    const isDiscovery = !!next && LESSONS.indexOf(next) >= 6;
    const due = !!state && (manual || eligible(state));
    useEffect(() => { if (quiet && isDiscovery && due) setDiscovery(true); if (!isDiscovery) setDiscovery(false); }, [quiet, isDiscovery, due]);
    useEffect(() => {
        if (practice && !messages.some(m => m.id === practice.message.id && m.content === practice.message.content)) setPractice(null);
    }, [messages, practice]);
    const validCorrection = correction && messages.some(m => m.id === correction.message.id && m.content === correction.message.content) ? correction : null;
    const source = [...messages].reverse().find(message => message.role === 'assistant' && message.content.trim());
    function explore(id: Lesson) {
        if (id === 'translation' || id === 'hint' || id === 'sticky') {
            const chosen = id === 'sticky' && validCorrection ? validCorrection.message : source;
            if (chosen) setPractice({ lesson: id, message: chosen, text: id === 'sticky' ? validCorrection?.text : undefined });
        } else if (id === 'goals' || id === 'reminders') {
            settings.openSection(id);
            // Reviewing already-configured preferences during replay needs no destructive edit.
            if (store.replaying) {
                const done = tutorialAction(id);
                if (id === 'goals') void dal.goals.forUser(settings.user.id).then(value => { if (value.slots.some(Boolean)) done(); }).catch(() => {});
                else void reminders.get(settings.user.id).then(value => { if (value.settings.enabled) done(); }).catch(() => {});
            }
        }
        else if (id === 'profile') settings.openProfile();
        else if (id === 'settings') settings.openSettings();
        else if (id === 'voice') onCreateThread();
        else if (id === 'teacher') {
            const panel = document.querySelector<HTMLDetailsElement>('.cw-ask-dot');
            if (panel) { panel.open = true; panel.scrollIntoView({ block: 'nearest' }); panel.querySelector<HTMLTextAreaElement>('textarea')?.focus(); }
        } else {
            const composer = document.querySelector<HTMLTextAreaElement>('.spelling-input textarea');
            composer?.scrollIntoView({ block: 'nearest' }); composer?.focus();
        }
    }
    const available = (id: Lesson) => !voice || !['translation','hint','sticky','spelling'].includes(id);
    const shown = next && quiet && (due || (isDiscovery && discovery)) && (isDiscovery ? LESSONS.slice(6).some(id => state?.steps[id] === 'pending' && available(id)) : available(next)) && (source || !['translation','hint','sticky'].includes(next));
    return <>
        {shown && <aside className="tutorial-callout" aria-label={isDiscovery ? 'More ways to learn' : 'Onboarding guidance'}>
            {isDiscovery ? <>
                <header><h2>More ways to learn</h2><button aria-expanded={!collapsed} onClick={() => setCollapsed(value => !value)}>{collapsed ? 'Expand' : 'Collapse'}</button></header>
                {!collapsed && <ul>{LESSONS.slice(6).filter(id => state?.steps[id] === 'pending' && available(id)).map(id => <li key={id}>
                    <div><strong>{LABELS[id]}</strong><p>{COPY[id]}</p>{!available(id) && <p>Available in a written thread.</p>}</div>
                    <button disabled={!available(id)} aria-label={`Explore ${LABELS[id]}`} onClick={() => explore(id)}>↗</button>
                    <button aria-label={`Skip ${LABELS[id]}`} onClick={() => store.skip(id)}>×</button>
                </li>)}</ul>}
                <button onClick={() => store.skipDiscovery()}>Hide suggestions (skip remaining)</button>
            </> : <>
                <p className="tutorial-eyebrow">{store.replaying ? 'Tutorial replay' : 'Explore Causerie'}</p>
                <h2>{LABELS[next]}</h2><p>{COPY[next]}</p>
                {next === 'sticky' && validCorrection && <p>Try making a note about “{validCorrection.text}” from your message.</p>}
                <div className="tutorial-actions"><button onClick={() => explore(next)}>{next === 'goals' ? 'Choose a goal' : next === 'reminders' ? 'Set a reminder' : 'Try it'}</button>
                    <button onClick={() => store.skip(next)}>{next === 'goals' || next === 'reminders' ? 'Later' : 'Continue'}</button></div>
            </>}
            {store.replaying ? <button onClick={() => store.endReplay()}>Exit replay</button> : <button onClick={() => store.skipAll()}>Skip tutorial</button>}
        </aside>}
        {practice && <TutorialPractice key={`${threadId}:${practice.lesson}:${practice.message.id}`} lesson={practice.lesson} message={practice.message} initialText={practice.text} onClose={() => setPractice(null)} />}
    </>;
}