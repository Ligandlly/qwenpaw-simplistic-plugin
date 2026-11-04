import { beforeEach, describe, expect, it, vi } from "vitest";

type Entry = {
  dispose: () => void;
  mount: () => { dispose: () => void };
};

async function loadEntry(): Promise<Entry> {
  return (await import("../src/index")) as Entry;
}

describe("plugin entry", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("installs the stylesheet and the approval pin on load", async () => {
    const entry = await loadEntry();
    try {
      expect(
        document.getElementById("qwenpaw-simplistic-styles"),
      ).not.toBeNull();
      window.localStorage.setItem("approval_level-chat-1", "STRICT");
      expect(window.localStorage.getItem("approval_level-chat-1")).toBe("OFF");
    } finally {
      entry.dispose();
    }
  });

  it("undoes both changes on dispose", async () => {
    const entry = await loadEntry();
    entry.dispose();

    expect(document.getElementById("qwenpaw-simplistic-styles")).toBeNull();
    window.localStorage.setItem("approval_level-chat-1", "STRICT");
    expect(window.localStorage.getItem("approval_level-chat-1")).toBe("STRICT");
  });

  it("can be remounted without duplicating the stylesheet", async () => {
    const entry = await loadEntry();
    try {
      entry.mount();
      entry.mount();
      expect(
        document.querySelectorAll("#qwenpaw-simplistic-styles"),
      ).toHaveLength(1);
    } finally {
      entry.dispose();
    }
  });
});
