import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Sticky, StickyColor } from "../../data/models/dao-types.ts";
import { parseCommandError } from "../../services/command-error.ts";
import { STICKY_EXAMPLES } from "./sticky-examples.ts";
import { MAX_STICKY_CATEGORIES, STICKY_CATEGORIES } from "../../data/models/sticky-categories";
import type { StickyCategory } from "../../data/models/sticky-categories";

interface Props {
    sticky: Sticky;
    onSave: (sticky: Sticky) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const COLORS: StickyColor[] = [
    "red",
    "blue",
    "green",
    "yellow",
    "violet",
];

export function StickyEditor({ sticky, onSave, onDelete }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const busyRef = useRef(false);

    const [title, setTitle] = useState(sticky.title);
    const [body, setBody] = useState(sticky.user_text);
    const [color, setColor] = useState<StickyColor>(sticky.color);
    const [categories, setCategories] = useState<StickyCategory[]>(
        () => [...sticky.categories],
    );
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const [example] = useState(() => {
        if (STICKY_EXAMPLES.length === 0) {
            return {
                title: "Give this sticky a title",
                body: "Write a note about the selected text.",
            };
        }

        return STICKY_EXAMPLES[Math.floor(Math.random() * STICKY_EXAMPLES.length)];
    });

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const previousFocus = document.activeElement;
        dialog.showModal();

        return () => {
            dialog.close();

            if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
                previousFocus.focus();
            }
        };
    }, []);

    async function saveAndClose() {
        if (busyRef.current) return;

        busyRef.current = true;
        setBusy(true);
        setError(null);

        try {
            await onSave({
                ...sticky,
                title: title.trim(),
                user_text: body,
                color,
                categories,
            });
        } catch (err) {
            setError(parseCommandError(err).message);
        } finally {
            busyRef.current = false;
            setBusy(false);
        }
    }

    async function deleteSticky() {
        if (busyRef.current) return;

        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        busyRef.current = true;
        setBusy(true);
        setError(null);

        try {
            await onDelete(sticky.id);
        } catch (reason) {
            setError(parseCommandError(reason).message);
        } finally {
            busyRef.current = false;
            setBusy(false);
        }
    }

    function toggleCategory(category: StickyCategory) {
        setCategories((previous) => {
            if (previous.includes(category)) {
                return previous.filter((item) => item !== category);
            }

            if (previous.length >= MAX_STICKY_CATEGORIES) {
                return previous;
            }

            return [...previous, category];
        });
    }

    return createPortal(
        <dialog
            ref={dialogRef}
            className={`sticky-editor sticky-color-${color}`}

            aria-labelledby="sticky-editor-heading"
            aria-describedby="sticky-editor-help"
            aria-busy={busy}
            onCancel={(event) => {
                event.preventDefault();
                void saveAndClose();
            }}
            onClick={(event) => {
                if (event.target !== event.currentTarget) return;

                const bounds =
                    event.currentTarget.getBoundingClientRect();

                const outside =
                    event.clientX < bounds.left ||
                    event.clientX > bounds.right ||
                    event.clientY < bounds.top ||
                    event.clientY > bounds.bottom;

                if (outside) {
                    void saveAndClose();
                }
            }}
        >
            <header className="sticky-editor-toolbar">
                <button
                    type="button"
                    className="sticky-delete"
                    disabled={busy}
                    aria-describedby={
                        confirmDelete
                            ? "sticky-delete-confirmation"
                            : undefined
                    }
                    onClick={() => void deleteSticky()}
                >
                    {confirmDelete ? "Confirm delete" : "Delete"}
                </button>

                <h2 id="sticky-editor-heading">Sticky note</h2>

                <button
                    type="button"
                    className="sticky-close"
                    disabled={busy}
                    aria-label="Save and close sticky"
                    title="Save and close"
                    onClick={() => void saveAndClose()}
                >
                    ×
                </button>
            </header>

            {confirmDelete && (
                <p
                    id="sticky-delete-confirmation"
                    className="sticky-delete-confirmation"
                    role="status"
                >
                    Press “Confirm delete” again to delete this sticky.
                </p>
            )}

            <label htmlFor="sticky-title">Title</label>
            <input
                id="sticky-title"
                autoFocus
                value={title}
                disabled={busy}
                placeholder={example.title}
                onChange={(event) => setTitle(event.target.value)}
            />

            <blockquote className="sticky-selected-text">
                {sticky.selected_text}
            </blockquote>

            <label htmlFor="sticky-body">Your note</label>
            <textarea
                id="sticky-body"
                rows={7}
                value={body}
                disabled={busy}
                placeholder={example.body}
                onChange={(event) => setBody(event.target.value)}
            />

            <fieldset className="sticky-colors" disabled={busy}>
                <legend>Highlight color</legend>

                <div className="sticky-color-options">
                    {COLORS.map((option) => (
                        <label
                            key={option}
                            className="sticky-color-option"
                        >
                            <input
                                type="radio"
                                name="sticky-color"
                                value={option}
                                checked={color === option}
                                onChange={() => setColor(option)}
                            />

                            <span
                                className={`sticky-swatch sticky-color-${option}`}
                                aria-hidden="true"
                            />

                            <span>
                                {option.charAt(0).toUpperCase() +
                                    option.slice(1)}
                            </span>
                        </label>
                    ))}
                </div>
            </fieldset>

            <fieldset
                className="sticky-categories"
                disabled={busy}
                aria-describedby="sticky-categories-help"
            >
                <legend>Categories</legend>

                <p id="sticky-categories-help" className="sticky-category-help">
                    Choose up to {MAX_STICKY_CATEGORIES}. Categories are optional.
                </p>

                <div className="sticky-category-options">
                    {STICKY_CATEGORIES.map((option) => {
                        const checked = categories.includes(option.id);
                        const atLimit =
                            categories.length >= MAX_STICKY_CATEGORIES;

                        return (
                            <label
                                key={option.id}
                                className="sticky-category-option"
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={!checked && atLimit}
                                    onChange={() => toggleCategory(option.id)}
                                />
                                <span>{option.label}</span>
                            </label>
                        );
                    })}
                </div>

                <p className="sticky-category-help" role="status">
                    {categories.length} of {MAX_STICKY_CATEGORIES} selected
                </p>
            </fieldset>

            <p id="sticky-editor-help" className="sticky-help">
                Close this panel or click outside it to save.
                Suggested text is only a placeholder.
            </p>

            {busy && <p role="status">Saving changes…</p>}

            {error && (
                <p className="sticky-error" role="alert">
                    {error}
                </p>
            )}
        </dialog>,
        document.body,
    );
}