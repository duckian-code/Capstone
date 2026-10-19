import type { Sticky } from "../data/models/dao-types";

export interface StickyTextPart {
    text: string;
    start: number;
    sticky?: Sticky;
}

export function splitStickyText( text:string, stickies:Sticky[] ) {
    const candidates = stickies.filter((sticky) => sticky.selected_text.length > 0)
        .slice()
        .sort((a, b) => b.selected_text.length - a.selected_text.length ||
        a.id.localeCompare(b.id));

    const parts: StickyTextPart[] = [];
    let cursor = 0;

    while (cursor < text.length) {
        let nextIndex = -1;
        let nextSticky: Sticky | undefined;


        for (const sticky of candidates) {
            const index = text.indexOf(
                sticky.selected_text,
                cursor,
            );

            if (
                index !== -1 &&
                (nextIndex === -1 || index < nextIndex)
            ) {
                nextIndex = index;
                nextSticky = sticky;
            }
        }

        if (!nextSticky) {
            parts.push({
                text: text.slice(cursor),
                start: cursor,
            });
            break;
        }

        if (nextIndex > cursor) {
            parts.push({
                text: text.slice(cursor, nextIndex),
                start: cursor,
            });
        }

        parts.push({
            text: nextSticky.selected_text,
            start: nextIndex,
            sticky: nextSticky,
        });

        cursor = nextIndex + nextSticky.selected_text.length;
    }

    return parts;
}