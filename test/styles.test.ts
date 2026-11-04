import { describe, expect, it } from "vitest";
import { injectStyles, removeStyles, STYLE_ID } from "../src/styles";

function css(): string {
  return document.getElementById(STYLE_ID)?.textContent ?? "";
}

describe("styles", () => {
  it("injects one style element", () => {
    injectStyles();
    injectStyles();
    expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
    expect(document.getElementById(STYLE_ID)?.parentElement).toBe(
      document.head,
    );
  });

  it("keeps only the session area in the sidebar", () => {
    injectStyles();
    const sheet = css();
    expect(sheet).toContain('class*="index-module__sessionArea__"');
    expect(sheet).toContain('class*="index-module__collapsedNav__"');
    expect(sheet).toContain(
      ".qwenpaw-layout-sider[class*=\"index-module__sider__\"] > .qwenpaw-layout-sider-children",
    );
    expect(sheet).toContain('class*="dockableSidebar-module__handle__"');
  });

  it("exempts the new-task button from the sidebar hide rule", () => {
    injectStyles();
    expect(css()).toContain(':not([class*="sidebarA-module__newTask__"])');
  });

  it("hides the composer controls without matching a hash", () => {
    injectStyles();
    const sheet = css();
    expect(sheet).toContain('class*="index-module__modeTrigger__"');
    expect(sheet).toContain(
      'class*="SessionProjectDirectory-module__trigger__"',
    );
    expect(sheet).toContain('class*="ApprovalToggle-module__trigger__"');
  });

  it("removes the style element", () => {
    injectStyles();
    removeStyles();
    expect(document.getElementById(STYLE_ID)).toBeNull();
  });
});
