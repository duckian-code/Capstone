import type { ConversationSummary } from "../../data/models/conversation-types.ts";
import { AccountPanel } from "../settings/SettingsMenus.tsx";

interface Props {
    threads: ConversationSummary[];
    activeThreadId: string;
    disabled?: boolean;
    onSelect: ( id: string ) => void;
    onCreate: () => void;
}

export function ThreadSidebar({threads, activeThreadId, disabled = false, onSelect, onCreate}: Props) {
    return (
        <aside className="cw-sidebar">
            <header className="cw-brand-header">
                <h1 className="cw-brand">Causerie</h1>
            </header>

            <div className="cw-sidebar-body">
                <button
                    type="button"
                    className="cw-new-thread"
                    disabled={disabled}
                    onClick={onCreate}
                >
                    + New thread
                </button>

                <nav className="cw-thread-nav" aria-label="Conversations">
                    {threads.length === 0 && (
                        <p className="cw-muted">No conversations yet.</p>
                    )}

                    <ul className="cw-thread-list">
                        {threads.map((thread) => (
                            <li key={thread.id}>
                                <button
                                    type="button"
                                    className="cw-thread"
                                    aria-current={
                                        thread.id === activeThreadId
                                            ? "page"
                                            : undefined
                                    }
                                    disabled={disabled}
                                    onClick={() => onSelect(thread.id)}
                                >
                                    {thread.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <footer className="cw-account-footer">
                <AccountPanel disabled={disabled} />
            </footer>
        </aside>
    )
}