import { beforeEach, describe, expect, it } from "vitest";
import { injectStyles } from "../src/styles";

function display(id: string): string {
  return getComputedStyle(document.getElementById(id)!).display;
}

describe("simplified layout", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <aside class="qwenpaw-layout-sider index-module__sider__a1">
        <div class="qwenpaw-layout-sider-children">
          <div id="brand" class="index-module__appBrand__b2">brand</div>
          <section id="tools" class="index-module__toolPanel__c3">tools</section>
          <button id="new-task" class="sidebarA-module__newTask__d4">new</button>
          <div id="sessions" class="index-module__sessionArea__e5">
            <div id="history">history</div>
          </div>
          <div id="usage" class="SidebarUsage-module__usageFrame__f6">usage</div>
          <div id="collapse" class="index-module__collapseToggleContainer__g7">
            collapse
          </div>
        </div>
      </aside>
      <button id="loop" class="index-module__modeTrigger__h8">Loop</button>
      <button
        id="project"
        class="SessionProjectDirectory-module__trigger__i9 index-module__senderProjectControl__j0"
      >
        default
      </button>
      <button
        id="approval"
        class="ApprovalToggle-module__trigger__k1 index-module__senderApprovalControl__l2"
      >
        auto
      </button>
    `;
    injectStyles();
  });

  it("keeps the new-task button and the session area, hides every other sidebar child", () => {
    expect(display("new-task")).not.toBe("none");
    expect(display("sessions")).not.toBe("none");
    expect(display("history")).not.toBe("none");
    for (const id of ["brand", "tools", "usage", "collapse"]) {
      expect(display(id), id).toBe("none");
    }
  });

  it("hides the composer controls", () => {
    for (const id of ["loop", "project", "approval"]) {
      expect(display(id), id).toBe("none");
    }
  });

  it("leaves only the new-task and history launchers on a collapsed rail", () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <aside class="qwenpaw-layout-sider index-module__sider__m3">
        <div class="qwenpaw-layout-sider-children">
          <nav class="index-module__collapsedNav__n4">
            <div class="index-module__collapsedNavPinned__o5">
              <button id="expand">expand</button>
              <button id="agent">agent</button>
              <button id="new">new</button>
              <button id="history-launch">history</button>
            </div>
            <div id="nav" class="index-module__collapsedNavScroll__p6">nav</div>
          </nav>
        </div>
      </aside>
      `,
    );

    expect(display("history-launch")).not.toBe("none");
    expect(display("new")).not.toBe("none");
    for (const id of ["expand", "agent", "nav"]) {
      expect(display(id), id).toBe("none");
    }
  });
});
