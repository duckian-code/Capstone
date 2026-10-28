import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
    ConversationMessage,
    ConversationStatus,
} from "../../data/models/conversation-types";

interface Props {
    message: ConversationMessage | null;
    status: ConversationStatus;
    unavailable: boolean;
    languageCode?: string;
}

export function MascotSpeech({ message, status, unavailable, languageCode }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const followLatest = useRef(true);
    const previousMessageId = useRef<string | null>(null);

    // retain outgoing text while box fades out
    const [retainedText, setRetainedText] = useState("");

    const hasText = Boolean(message?.content.trim());
    const visible = !unavailable && status !== "waiting" && hasText;

    const text = visible ? message!.content : retainedText;
    const messageId = message?.id ?? null;

    useEffect(() => {
        if (visible && message) {
            setRetainedText(message.content);
        }
    }, [visible, message]);

    useLayoutEffect(() => {
        const container = scrollRef.current;
        if (!container || !visible) return;

        if (previousMessageId.current !== messageId) {
            previousMessageId.current = messageId;
            followLatest.current = true;
            container.scrollTop = 0;
        }

        // follow animated text, but open completed/historical replies at their beginning so they can be read from the top
        if (status === "responding" && followLatest.current) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messageId, text, visible, status]);

    const completedText =
        visible && status !== "responding"
            ? message?.content ?? ""
            : "";

    return (
        <div className="mascot-speech-slot">
            <section
                className="mascot-speech"
                data-visible={visible}
                aria-label="Dot’s latest reply"
                aria-hidden={!visible}
                inert={!visible}
            >
                <div
                    ref={scrollRef}
                    className="mascot-speech-scroll"
                    role="region"
                    aria-label="Reply text"
                    tabIndex={visible ? 0 : -1}
                    lang={languageCode}
                    onScroll={(event) => {
                        const element = event.currentTarget;

                        followLatest.current =
                            element.scrollHeight -
                            element.scrollTop -
                            element.clientHeight < 40;
                    }}
                >
                    <p>{text}</p>
                </div>
            </section>

            {/* Announce the completed reply, not each typewriter update. */}
            <span
                className="mascot-speech-announcement"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                lang={languageCode}
            >
                {completedText}
            </span>
        </div>
    );
}