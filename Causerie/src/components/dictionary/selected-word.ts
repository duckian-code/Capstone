const WORD = /^\p{L}[\p{L}\p{M}]*(?:['’\-‐‑]\p{L}[\p{L}\p{M}]*)*$/u;
const WORD_CHARACTER = /[\p{L}\p{M}'’\-‐‑]/u;

// accept ONE complete word within container. Apostrophes/hyphens allows. NO PUNCTUATION/MULTIPLE WORDS
export function selectedWord(container: HTMLElement, range: Range): string | null {
    if (
        range.collapsed ||
        !container.contains(range.startContainer) ||
        !container.contains(range.endContainer)
    ) {
        return null;
    }

    const raw = range.toString();
    const word = raw.trim();

    if (!WORD.test(word) || Array.from(word).length > 100) { return null; }

    // Check surrounding text so selecting "jour" inside "bonjour" does not count as selecting a complete word.
    const prefix = range.cloneRange();
    prefix.selectNodeContents(container);
    prefix.setEnd(range.startContainer, range.startOffset);

    const suffix = range.cloneRange();
    suffix.selectNodeContents(container);
    suffix.setStart(range.endContainer, range.endOffset);

    const leadingWhitespace = raw.match(/^\s*/u)?.[0] ?? "";
    const trailingWhitespace = raw.match(/\s*$/u)?.[0] ?? "";

    const before = Array.from(prefix.toString() + leadingWhitespace);
    const after = Array.from(trailingWhitespace + suffix.toString());

    const previousCharacter = before[before.length - 1] ?? "";
    const nextCharacter = after[0] ?? "";

    if (
        WORD_CHARACTER.test(previousCharacter) ||
        WORD_CHARACTER.test(nextCharacter)
    ) {
        return null;
    }

    return word.normalize("NFC");
}