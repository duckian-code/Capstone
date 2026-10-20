import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import type {
    FormEvent,
    ReactNode,
} from "react";
import { createPortal } from "react-dom";

import type {
    User,
    UserChanges,
} from "../../data/models/dao-types";
import {
    LANGUAGE_OPTIONS,
    PRONOUN_OPTIONS,
} from "../../data/models/onboarding-types";
import { dal } from "../../data/dal";
import { credentials } from "../../services/credentials";
import { parseCommandError } from "../../services/command-error";

import {
    SETTINGS_SECTIONS,
    type SettingsDraft,
} from "./settings-sections";

import "./settings.css";

const DEFAULT_AVATAR_URL = "/images/default-avatar.png";

interface SettingsContextValue {
    user: User;
    openProfile: () => void;
    openSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface ProviderProps {
    user: User;
    onUserChange: (userId: string, changes: UserChanges) => void;
    children: ReactNode;
}

export function SettingsProvider({
                                     user,
                                     onUserChange,
                                     children,
                                 }: ProviderProps) {
    const [menu, setMenu] = useState<"profile" | "settings" | null>(
        null,
    );

    function applyChanges(changes: UserChanges) {
        onUserChange(user.id, changes);
    }

    return (
        <SettingsContext.Provider
            value={{
                user,
                openProfile: () => setMenu("profile"),
                openSettings: () => setMenu("settings"),
            }}
        >
            {children}

            {menu === "profile" && (
                <ProfileMenu
                    user={user}
                    onSaved={applyChanges}
                    onClose={() => setMenu(null)}
                />
            )}

            {menu === "settings" && (
                <FullSettingsMenu
                    user={user}
                    onSaved={applyChanges}
                    onClose={() => setMenu(null)}
                />
            )}
        </SettingsContext.Provider>
    );
}

function useSettings() {
    const context = useContext(SettingsContext);

    if (!context) {
        throw new Error(
            "Settings controls must be inside SettingsProvider.",
        );
    }

    return context;
}

function Avatar({
                    source,
                    name,
                }: {
    source?: string | null;
    name: string;
}) {
    const src = source || DEFAULT_AVATAR_URL;
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [src]);

    if (failed) {
        return (
            <span className="settings-avatar-fallback" aria-hidden="true">
                {name.trim().charAt(0).toUpperCase() || "?"}
            </span>
        );
    }

    return (
        <img
            className="settings-avatar"
            src={src}
            alt=""
            onError={() => setFailed(true)}
        />
    );
}

export function AccountPanel({
                                 disabled = false,
                             }: {
    disabled?: boolean;
}) {
    const { user, openProfile, openSettings } = useSettings();
    const name = user.display_name || "Your profile";

    return (
        <div className="account-panel">
            <button
                type="button"
                className="account-profile"
                disabled={disabled}
                onClick={openProfile}
                aria-label={`Open profile settings for ${name}`}
            >
                <Avatar source={user.avatar_data_url} name={name} />

                <span className="account-summary">
                    <strong>{name}</strong>
                    <small>{user.pronouns || "Your profile"}</small>
                </span>
            </button>

            <button
                type="button"
                className="account-gear"
                disabled={disabled}
                onClick={openSettings}
                aria-label="Open application settings"
                title="Settings"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    aria-hidden="true"
                >
                    <path
                        d="m9 3-.6 2.3-2 .9L4.2 5.6 2.7 8.2
                           4.3 10v2l-1.6 1.8 1.5 2.6 2.2-.6
                           2 .9L9 19h3l.6-2.3 2-.9 2.2.6
                           1.5-2.6L16.7 12v-2l1.6-1.8
                           -1.5-2.6-2.2.6-2-.9L12 3Z"
                        transform="translate(1.5 1)"
                    />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            </button>
        </div>
    );
}

interface ModalProps {
    title: string;
    wide?: boolean;
    dirty: boolean;
    busy: boolean;
    onClose: () => void;
    children: ReactNode;
}

function SettingsModal({title, wide = false, dirty, busy, onClose, children,}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [confirmClose, setConfirmClose] = useState(false);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const previousFocus = document.activeElement;
        dialog.showModal();

        return () => {
            dialog.close();

            if (
                previousFocus instanceof HTMLElement &&
                previousFocus.isConnected
            ) {
                previousFocus.focus();
            }
        };
    }, []);

    useEffect(() => {
        if (!dirty) {
            setConfirmClose(false);
        }
    }, [dirty]);

    function requestClose() {
        if (busy) return;

        if (dirty) {
            setConfirmClose(true);
        } else {
            onClose();
        }
    }

    return createPortal(
        <dialog
            ref={dialogRef}
            className={
                `settings-modal ${wide ? "settings-modal-wide" : ""}`
            }
            aria-labelledby="settings-modal-title"
            aria-busy={busy}
            onCancel={(event) => {
                event.preventDefault();
                requestClose();
            }}
            onClick={(event) => {
                if (event.target !== event.currentTarget) return;

                const bounds =
                    event.currentTarget.getBoundingClientRect();

                if (
                    event.clientX < bounds.left ||
                    event.clientX > bounds.right ||
                    event.clientY < bounds.top ||
                    event.clientY > bounds.bottom
                ) {
                    requestClose();
                }
            }}
        >
            <header className="settings-modal-header">
                <h2 id="settings-modal-title">{title}</h2>

                <button
                    type="button"
                    className="settings-close"
                    disabled={busy}
                    aria-label={`Close ${title}`}
                    onClick={requestClose}
                >
                    ×
                </button>
            </header>

            {confirmClose && (
                <div className="settings-close-confirmation">
                    <p role="alert">You have unsaved changes.</p>

                    <div className="settings-actions">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => setConfirmClose(false)}
                        >
                            Keep editing
                        </button>

                        <button
                            type="button"
                            disabled={busy}
                            onClick={onClose}
                        >
                            Discard and close
                        </button>
                    </div>
                </div>
            )}

            {children}
        </dialog>,
        document.body,
    );
}

interface EditorProps {
    user: User;
    onSaved: (changes: UserChanges) => void;
    onClose: () => void;
}

async function readAvatar(file: File): Promise<string> {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        throw new Error("Choose a PNG, JPEG, or WebP image.");
    }

    if (file.size > 2 * 1024 * 1024) {
        throw new Error("Choose an image smaller than 2 MB.");
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(new Error("The image could not be read."));
            }
        };

        reader.onerror = () => {
            reject(new Error("The image could not be read."));
        };

        reader.onabort = () => {
            reject(new Error("Image loading was cancelled."));
        };

        reader.readAsDataURL(file);
    });

    // Verify selected file can actually be decoded image
    await new Promise<void>((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve();
        image.onerror = () => {
            reject(new Error("The selected image could not be opened."));
        };

        image.src = dataUrl;
    });

    return dataUrl;
}

function ProfileMenu({ user, onSaved, onClose }: EditorProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const busyRef = useRef(false);

    const [name, setName] = useState(user.display_name ?? "");
    const [pronouns, setPronouns] = useState(user.pronouns ?? "");
    const [avatar, setAvatar] = useState<string | null>(user.avatar_data_url ?? null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const dirty =
        name !== (user.display_name ?? "") ||
        pronouns !== (user.pronouns ?? "") ||
        avatar !== (user.avatar_data_url ?? null);

    async function chooseAvatar(file: File) {
        if (busyRef.current) return;

        busyRef.current = true;
        setBusy(true);
        setError(null);
        setSaved(false);

        try {
            setAvatar(await readAvatar(file));
        } catch (reason) {
            setError(parseCommandError(reason).message);
        } finally {
            busyRef.current = false;
            setBusy(false);
        }
    }

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (busyRef.current || !dirty) return;

        const displayName = name.trim();

        if (!displayName || displayName.length > 80) {
            setError("Enter a name between 1 and 80 characters.");
            return;
        }

        if (!PRONOUN_OPTIONS.some(
            (option) => option.value === pronouns,
        )) {
            setError("Select your pronouns.");
            return;
        }

        busyRef.current = true;
        setBusy(true);
        setError(null);
        setSaved(false);

        try {
            await dal.users.saveIdentity(
                user.id,
                displayName,
                pronouns,
                avatar,
            );

            onSaved({
                display_name: displayName,
                pronouns,
                avatar_data_url: avatar,
            });

            setName(displayName);
            setSaved(true);
        } catch (reason) {
            setError(parseCommandError(reason).message);
        } finally {
            busyRef.current = false;
            setBusy(false);
        }
    }

    return (
        <SettingsModal title="Your profile" dirty={dirty} busy={busy} onClose={onClose}>
            <form className="settings-form" onSubmit={save}>
                <fieldset disabled={busy}>
                    <legend className="settings-sr-only">
                        Profile fields
                    </legend>

                    <div className="profile-avatar-controls">
                        <button type="button" className="profile-avatar-button" aria-label="Choose a profile picture" onClick={() => fileRef.current?.click()}>
                            <Avatar source={avatar} name={name} />
                        </button>

                        <div>
                            <p>Click your picture to change it.</p>

                            <button type="button" disabled={!avatar} onClick={() => {
                                setAvatar(null);
                                setSaved(false);
                                }}>
                                Use default picture
                            </button>
                        </div>
                    </div>

                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden
                        onChange={(event) => {
                            const file = event.currentTarget.files?.[0];
                            event.currentTarget.value = "";

                            if (file) {
                                void chooseAvatar(file);
                            }
                        }}/>

                    <div className="settings-fields">
                        <label htmlFor="profile-name">Name</label>
                        <input id="profile-name" autoFocus value={name} maxLength={80} required autoComplete="given-name"
                            onChange={(event) => {
                                setName(event.currentTarget.value);
                                setSaved(false);
                            }}
                        />

                        <label htmlFor="profile-pronouns">
                            Pronouns
                        </label>
                        <select id="profile-pronouns" value={pronouns} required
                            onChange={(event) => {
                                setPronouns(event.currentTarget.value);
                                setSaved(false);
                            }}
                        >
                            <option value="" disabled>
                                Select pronouns
                            </option>

                            {PRONOUN_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {dirty && (
                        <div className="settings-save-bar">
                            <span>You have unsaved changes.</span>
                            <button type="submit">
                                {busy ? "Saving…" : "Save changes"}
                            </button>
                        </div>
                    )}
                </fieldset>

                {error && (
                    <p className="settings-error" role="alert">
                        {error}
                    </p>
                )}

                {saved && !dirty && (
                    <p role="status">Profile saved.</p>
                )}
            </form>
        </SettingsModal>
    );
}

function FullSettingsMenu({ user, onSaved, onClose }: EditorProps) {
    const busyRef = useRef(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [activeSection, setActiveSection] = useState(SETTINGS_SECTIONS[0]?.id ?? "");

    const [draft, setDraft] = useState<SettingsDraft>({
        targetLanguage: user.target_language ?? "French",
        apiKey: ""
    });

    const dirty = draft.targetLanguage !== (user.target_language ?? "French") || draft.apiKey.length > 0;

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (busyRef.current || !dirty) return;

        if (!LANGUAGE_OPTIONS.some(
            (option) => option.value === draft.targetLanguage,
        )) {
            setError("Select a supported language.");
            return;
        }

        const replacingKey = draft.apiKey.length > 0;
        const apiKey = draft.apiKey.trim();

        if (
            replacingKey &&
            (!apiKey || apiKey.length > 8192 || /\s/.test(apiKey))
        ) {
            setError("Enter an API key without spaces.");
            return;
        }

        busyRef.current = true;
        setBusy(true);
        setError(null);
        setSaved(false);

        let languageSaved = false;
        let keyAttempted = false;

        try {
            if (
                draft.targetLanguage !== (user.target_language ?? "French")
            ) {
                await dal.users.saveTargetLanguage(user.id, draft.targetLanguage);

                onSaved({ target_language: draft.targetLanguage });

                languageSaved = true;
            }

            if (replacingKey) {
                keyAttempted = true;
                await credentials.saveApiKey(apiKey);
            }

            setSaved(true);
        } catch (reason) {
            const message = parseCommandError(reason).message;

            setError(
                (languageSaved ? "Your target language was saved. " : "") + message +
                (keyAttempted ? " Re-enter the replacement API key to retry." : ""),
            );
        } finally {
            // Keep the secret out of form state after attempting its save.
            if (keyAttempted) {
                setDraft((previous) => ({
                    ...previous,
                    apiKey: "",
                }));
            }

            busyRef.current = false;
            setBusy(false);
        }
    }

    return (
        <SettingsModal title="Settings" wide dirty={dirty} busy={busy} onClose={onClose}>
            <div className="settings-layout">
                <nav className="settings-navigation" aria-label="Settings sections">
                    {SETTINGS_SECTIONS.map((section) => (
                        <button key={section.id} type="button" aria-current={
                                activeSection === section.id
                                    ? "location"
                                    : undefined
                            }
                            onClick={() => {
                                setActiveSection(section.id);

                                document.getElementById(`settings-section-${section.id}`,)
                                    ?.scrollIntoView({
                                        block: "start",
                                        behavior: "smooth",
                                    });
                            }}>
                            {section.label}
                        </button>
                    ))}
                </nav>

                <form className="settings-content" onSubmit={save}>
                    <fieldset disabled={busy}>
                        <legend className="settings-sr-only">
                            Application settings
                        </legend>

                        {SETTINGS_SECTIONS.map(
                            ({ id, label, Component }) => (
                                <section
                                    key={id}
                                    id={`settings-section-${id}`}
                                    className="settings-section"
                                    aria-labelledby={
                                        `settings-section-title-${id}`
                                    }
                                >
                                    <h3
                                        id={`settings-section-title-${id}`}
                                    >
                                        {label}
                                    </h3>

                                    <Component
                                        draft={draft}
                                        setDraft={setDraft}
                                    />
                                </section>
                            ),
                        )}

                        {dirty && (
                            <div className="settings-save-bar">
                                <span>You have unsaved changes.</span>
                                <button type="submit">
                                    {busy ? "Saving…" : "Save changes"}
                                </button>
                            </div>
                        )}
                    </fieldset>

                    {error && (
                        <p className="settings-error" role="alert">
                            {error}
                        </p>
                    )}

                    {saved && !dirty && (
                        <p role="status">Settings saved.</p>
                    )}
                </form>
            </div>
        </SettingsModal>
    );
}
