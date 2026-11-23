import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Lesson } from "../../services/tutorial-model";

const CONTENT: Record<string, { title: string; description: string }> = {
    spelling: {
        title: "Spelling",
        description: "Check your draft.",
    },
    profile: {
        title: "Profile",
        description: "Update your details.",
    },
    settings: {
        title: "Settings",
        description: "Adjust preferences.",
    },
    voice: {
        title: "Voice threads",
        description: "Explore speaking practice.",
    },
};

interface Props {
    items: Lesson[];
    collapsed: boolean;
    onToggle: () => void;
    available: (id: Lesson) => boolean;
    busy: boolean;
    onExplore: (id: Lesson) => void;
    onSkip: (id: Lesson) => void;
    onSkipAll: () => void;
    replaying: boolean;
    onExitReplay: () => void;
}

export function TutorialDiscovery({
                                      items,
                                      collapsed,
                                      onToggle,
                                      available,
                                      busy,
                                      onExplore,
                                      onSkip,
                                      onSkipAll,
                                      replaying,
                                      onExitReplay,
                                  }: Props) {
    const [host, setHost] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setHost(document.getElementById("tutorial-discovery-host"));
    }, []);

    if (!host) return null;

    return createPortal(
        <aside
            className="tutorial-discovery"
            aria-labelledby="tutorial-discovery-title">
            <header>
                <h2 id="tutorial-discovery-title">
                    More ways to learn
                </h2>

                <button
                    type="button"
                    aria-expanded={!collapsed}
                    aria-controls="tutorial-discovery-items"
                    aria-label={
                        collapsed
                            ? "Expand learning suggestions"
                            : "Collapse learning suggestions"
                    }
                    onClick={onToggle}>
                    {collapsed ? "+" : "−"}
                </button>
            </header>

            {!collapsed && (
                <ul id="tutorial-discovery-items">
                    {items.map(id => {
                        const content = CONTENT[id];
                        if (!content) return null;

                        const usable = available(id);

                        return (
                            <li key={id}>
                                <div>
                                    <strong>{content.title}</strong>
                                    <p>
                                        {usable
                                            ? content.description
                                            : "Use a written thread."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    disabled={busy || !usable}
                                    aria-label={`Explore ${content.title}`}
                                    onClick={() => onExplore(id)}>
                                    ↗
                                </button>

                                <button
                                    type="button"
                                    aria-label={`Skip ${content.title}`}
                                    onClick={() => onSkip(id)}>
                                    ×
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            <footer>
                <button type="button" onClick={onSkipAll}>
                    Skip remaining
                </button>

                {replaying && (
                    <button type="button" onClick={onExitReplay}>
                        Exit replay
                    </button>
                )}
            </footer>
        </aside>,
        host,
    );
}