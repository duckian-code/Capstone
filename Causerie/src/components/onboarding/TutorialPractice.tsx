import { useEffect, useRef, useState } from 'react';
import { useDictionary } from '../dictionary/DictionaryProvider';
import { useStickies } from '../sticky/StickyProvider';
import { useMessageHints, hasMultipleWords } from '../hints/MessageHints';
import type { ConversationMessage } from '../../data/models/conversation-types';

export function TutorialPractice({ lesson, message, initialText, onClose }: {
    lesson: 'translation' | 'hint' | 'sticky'; message: ConversationMessage; initialText?: string; onClose: () => void;
}) {
    const matches = [...message.content.matchAll(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’\-]*/gu)];
    const words = matches.map(match => match[0]);
    const first = matches[0], last = matches[Math.min(4, matches.length-1)];
    const defaultText = lesson === 'translation' ? words[0] ?? '' : first && last ? message.content.slice(first.index, last.index! + last[0].length) : '';
    const [text, setText] = useState(initialText ?? defaultText);
    const [choosing, setChoosing] = useState(true);
    const ref = useRef<HTMLDialogElement>(null);
    const { openWord } = useDictionary();
    const { openText } = useStickies();
    const hints = useMessageHints(message.id, message.content);
    useEffect(() => {
        if (!choosing && !hints.isOpen) onClose();
    }, [choosing, hints.isOpen, onClose]);
    useEffect(() => {
        const dialog = ref.current;
        const previous = document.activeElement;
        dialog?.showModal();
        return () => { dialog?.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
    }, []);
    const selected = text.trim();
    const index = message.content.indexOf(selected);
    const valid = !!selected && index >= 0 && (lesson === 'hint' ? hasMultipleWords(selected) : lesson === 'translation' ? words.includes(selected) : true);
    function open() {
        if (!valid) return;
        ref.current?.close(); setChoosing(false);
        if (lesson === 'translation') { openWord(selected); onClose(); }
        else if (lesson === 'sticky') { openText(selected); onClose(); }
        else hints.openRequest({ selected_text: selected, start_offset: index, end_offset: index + selected.length });
    }
    return <>{choosing && <dialog className="tutorial-picker" ref={ref} onCancel={onClose} aria-labelledby="tutorial-picker-title">
        <h2 id="tutorial-picker-title">{lesson === 'translation' ? 'Choose a word to translate' : 'Choose text from this message'}</h2>
        <blockquote>{message.content}</blockquote>
        <label>Selected text<input autoFocus value={text} onChange={e => setText(e.target.value)} /></label>
        <p>{lesson === 'translation' ? 'Enter one word exactly as it appears above.' : 'Enter a phrase exactly as it appears above. Hints require at least two words.'}</p>
        <button disabled={!valid} onClick={open}>{lesson === 'translation' ? 'Translate' : lesson === 'hint' ? 'Get hint' : 'Create sticky'}</button>
        <button onClick={onClose}>Back to conversation</button>
    </dialog>}{hints.ui}</>;
}