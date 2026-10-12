import { describe, expect, it } from "vitest";
import { normalizeMessageBody } from "../src/utils/normalizeMessageBody";

const ZWSP = String.fromCharCode(0x200b);
const LS = String.fromCharCode(0x2028);

describe("normalizeMessageBody", () => {
  it("strips returns typed after the text", () => {
    expect(normalizeMessageBody("What's good bro?\n\n\n")).toBe("What's good bro?");
  });

  it("strips returns and spaces typed before the text", () => {
    expect(normalizeMessageBody("\n\n   hello")).toBe("hello");
  });

  it("turns a draft of only returns/spaces into nothing to send", () => {
    expect(normalizeMessageBody("\n\n \n\t\n")).toBe("");
    expect(normalizeMessageBody(`${ZWSP}\n${LS} `)).toBe("");
  });

  it("collapses runs of blank lines inside the text to one blank line", () => {
    expect(normalizeMessageBody("first\n\n\n\n\nsecond")).toBe("first\n\nsecond");
  });

  it("keeps single line breaks and one blank line as written", () => {
    expect(normalizeMessageBody("line one\nline two\n\nparagraph")).toBe("line one\nline two\n\nparagraph");
  });

  it("removes trailing spaces per line but keeps indentation", () => {
    expect(normalizeMessageBody("a   \n  b  ")).toBe("a\n  b");
  });

  it("normalizes CRLF and unicode line separators", () => {
    expect(normalizeMessageBody(`a\r\n\r\n\r\n\r\nb${LS}`)).toBe("a\n\nb");
  });
});
