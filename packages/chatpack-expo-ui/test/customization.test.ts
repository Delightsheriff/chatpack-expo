import { describe, expect, it } from "vitest";
import { createTheme, darkTheme, lightTheme } from "../src/theme/tokens";
import { createSlotResolver, fontStyle } from "../src/customization/resolveSlots";
import { defaultLabels, resolveLabels } from "../src/customization/labels";

const bubbleState = {
  isOwn: true,
  align: "end" as const,
  groupedWithPrevious: false,
  groupedWithNext: false,
  variant: "default" as const,
  bubbleAlign: "end" as const,
  deleted: false,
  pressed: false,
};

describe("createTheme", () => {
  it("deep-merges a partial override onto the light theme", () => {
    const theme = createTheme({ colors: { accent: "#7C3AED" }, bubble: { radius: 24 } });
    expect(theme.colors.accent).toBe("#7C3AED");
    expect(theme.colors.background).toBe(lightTheme.colors.background);
    expect(theme.bubble.radius).toBe(24);
    expect(theme.bubble.groupedRadius).toBe(lightTheme.bubble.groupedRadius);
  });

  it("uses the given base theme", () => {
    const theme = createTheme({ colors: { accent: "#7C3AED" } }, darkTheme);
    expect(theme.colors.background).toBe(darkTheme.colors.background);
  });

  it("never mutates the base theme", () => {
    createTheme({ colors: { accent: "red" }, components: { Composer: { input: { fontSize: 20 } } } });
    expect(lightTheme.colors.accent).not.toBe("red");
    expect(lightTheme.components.Composer).toBeUndefined();
  });

  it("replaces slot functions instead of merging into them", () => {
    const fn = () => ({ opacity: 0.5 });
    const theme = createTheme({ components: { Bubble: { bubble: fn } } });
    expect(theme.components.Bubble?.bubble).toBe(fn);
  });
});

describe("createSlotResolver", () => {
  it("returns undefined for a slot nobody styled", () => {
    const slots = createSlotResolver("Bubble", lightTheme, {}, bubbleState);
    expect(slots.style("text")).toBeUndefined();
  });

  it("layers theme styles before instance styles", () => {
    const theme = createTheme({ components: { Bubble: { text: { fontSize: 14 } } } });
    const slots = createSlotResolver("Bubble", theme, { styles: { text: { fontSize: 20 } } }, bubbleState);
    expect(slots.style("text")).toEqual([{ fontSize: 14 }, { fontSize: 20 }]);
  });

  it("calls function slots with component state, merged with a per-call override", () => {
    const theme = createTheme({
      components: { Bubble: { bubble: ({ isOwn, pressed }) => ({ opacity: pressed ? 0.5 : 1, marginLeft: isOwn ? 40 : 0 }) } },
    });
    const slots = createSlotResolver("Bubble", theme, {}, bubbleState);
    expect(slots.style("bubble")).toEqual({ opacity: 1, marginLeft: 40 });
    expect(slots.style("bubble", { pressed: true })).toEqual({ opacity: 0.5, marginLeft: 40 });
  });

  it("returns classNames per slot, falling back to the given default", () => {
    const slots = createSlotResolver("Bubble", lightTheme, { classNames: { text: "font-bold" } }, bubbleState);
    expect(slots.className("text")).toEqual({ className: "font-bold" });
    expect(slots.className("bubble", "rounded-xl")).toEqual({ className: "rounded-xl" });
    expect(slots.className("container")).toEqual({});
  });
});

describe("fontStyle", () => {
  it("uses only fontWeight with no custom fonts", () => {
    expect(fontStyle(lightTheme, "semibold")).toEqual({ fontWeight: "600" });
  });

  it("uses the weight's own family without fontWeight", () => {
    const theme = createTheme({ fonts: { regular: "Inter-Regular", semibold: "Inter-SemiBold" } });
    expect(fontStyle(theme, "semibold")).toEqual({ fontFamily: "Inter-SemiBold" });
  });

  it("falls back to the regular family plus fontWeight", () => {
    const theme = createTheme({ fonts: { regular: "Inter" } });
    expect(fontStyle(theme, "bold")).toEqual({ fontFamily: "Inter", fontWeight: "700" });
  });
});

describe("resolveLabels", () => {
  it("keeps defaults for anything not overridden, including nested receipt labels", () => {
    const labels = resolveLabels({ send: "Enviar", receipt: { read: "Leído" } });
    expect(labels.send).toBe("Enviar");
    expect(labels.reply).toBe(defaultLabels.reply);
    expect(labels.receipt.read).toBe("Leído");
    expect(labels.receipt.sent).toBe(defaultLabels.receipt.sent);
  });

  it("caps unread counts by default", () => {
    expect(defaultLabels.unreadCount(5)).toBe("5");
    expect(defaultLabels.unreadCount(120)).toBe("99+");
  });
});
