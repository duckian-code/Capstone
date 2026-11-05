import type { SpellingIssue } from "../../services/spelling";

// Keep unaffected errors aligned after replacements, typing, paste, or undo
// Changed/new words are checked only on the next explicit Check spelling click
export function remapIssues( before: string, after: string, issues: SpellingIssue[] ): SpellingIssue[] {
    if (before === after) return issues;
    let start = 0;
    while (start < before.length && start < after.length
    && before[start] === after[start]) start++;
    let oldEnd = before.length;
    let newEnd = after.length;
    while (oldEnd > start && newEnd > start
    && before[oldEnd - 1] === after[newEnd - 1]) {
        oldEnd--;
        newEnd--;
    }
    const delta = after.length - before.length;
    const words = new Map<number, string>();
    const pattern = /\p{L}[\p{L}\p{M}]*(?:['’\-‐‑]\p{L}[\p{L}\p{M}]*)*/gu;
    for (const match of after.matchAll(pattern)) words.set(match.index!, match[0]);
    return issues.flatMap((issue) => {
        let next: SpellingIssue;
        if (issue.end <= start) next = issue;
        else if (issue.start >= oldEnd) {
            next = { ...issue, start: issue.start + delta, end: issue.end + delta };
        } else return [];
        // Also reject edits at a word boundary that merge or extend a token
        return words.get(next.start) === next.word
        && next.end - next.start === next.word.length ? [next] : [];
    });
}