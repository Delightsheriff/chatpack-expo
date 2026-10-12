const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);
const ZERO_WIDTH_CHARS = [0x200b, 0x200c, 0x200d, 0xfeff].map((code) => String.fromCharCode(code)).join("");

const LINE_BREAKS = new RegExp(`\\r\\n?|${LINE_SEPARATOR}|${PARAGRAPH_SEPARATOR}`, "g");
const ZERO_WIDTH = new RegExp(`[${ZERO_WIDTH_CHARS}]`, "g");
const TRAILING_SPACE = /\s+$/u;
const BLANK_LINE_RUN = /\n{3,}/g;

/**
 * Cleans a draft before it's sent:
 * - strips leading/trailing whitespace, including blank lines (returns typed
 *   before or after the text),
 * - removes trailing spaces at the end of each line,
 * - collapses runs of blank lines inside the text to a single blank line.
 *
 * A draft that is only whitespace/returns normalizes to `""` and can't be
 * sent. Unicode line/paragraph separators and zero-width spaces count as
 * whitespace here (some keyboards and pastes insert them).
 */
export function normalizeMessageBody(text: string): string {
  return text
    .replace(LINE_BREAKS, "\n")
    .replace(ZERO_WIDTH, "")
    .split("\n")
    .map((line) => line.replace(TRAILING_SPACE, ""))
    .join("\n")
    .replace(BLANK_LINE_RUN, "\n\n")
    .trim();
}
