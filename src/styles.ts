/**
 * The plugin is CSS-only for layout changes: the console has no public API to
 * remove sidebar sections or sender controls, but every one of them carries a
 * stable CSS-module local name (the hash suffix changes between builds). The
 * selectors below match on those local names, never on the hashes, so they
 * keep working across console releases.
 */

export const STYLE_ID = "qwenpaw-simplistic-styles";

const CSS = `
/* ── Sidebar: keep the new-task button and the conversation history ─────
   Expanded, the sidebar children are: brand, tools panel, new-task button,
   plugin slots, session area, auth actions, usage capsule and the collapse
   row. Drop every direct child except the session area and the new-task
   button. */
.qwenpaw-layout-sider[class*="index-module__sider__"] > .qwenpaw-layout-sider-children > *:not([class*="index-module__sessionArea__"]):not([class*="index-module__collapsedNav__"]):not([class*="sidebarA-module__newTask__"]) {
  display: none !important;
}

/* Collapsed rail: keep the new-task and history launchers. The pinned group
   is (expand, agent, new task, history), so only the last two survive. */
[class*="index-module__collapsedNavScroll__"] {
  display: none !important;
}
[class*="index-module__collapsedNavPinned__"] > *:not(:nth-last-child(-n+2)) {
  display: none !important;
}

/* The dock/float grip sits outside the antd Sider, so the rules above cannot
   reach it. The dock button only appears while floating and stays available. */
[class*="dockableSidebar-module__handle__"] {
  display: none !important;
}

/* ── Composer: hide Loop mode, project directory and approval controls ──
   Matched by component module name so the rules also cover the compact /
   mobile sender, where the host-specific className differs. */
[class*="index-module__modeTrigger__"],
[class*="SessionProjectDirectory-module__trigger__"],
[class*="ApprovalToggle-module__trigger__"],
[class*="HarnessApprovalToggle-module__trigger__"] {
  display: none !important;
}

/* ── Empty conversation: drop the welcome hero ─────────────────────────
   A new conversation renders the greeting, the sample prompts and the
   "start a new journey" cards inside the message list. Hide the whole
   welcome variant of the list so no empty gap is left behind; the plain
   .qwenpaw-chat-anywhere-message-list (real messages) is untouched. */
.qwenpaw-chat-anywhere-message-list-welcome,
[class*="ChatWelcome-module__welcome__"] {
  display: none !important;
}
`;

export function injectStyles(doc: Document = document): void {
  const existing = doc.getElementById(STYLE_ID);
  if (existing) {
    // Keep the sheet current when the bundle is re-evaluated without a reload.
    existing.textContent = CSS;
    return;
  }
  const element = doc.createElement("style");
  element.id = STYLE_ID;
  element.textContent = CSS;
  doc.head.appendChild(element);
}

export function removeStyles(doc: Document = document): void {
  doc.getElementById(STYLE_ID)?.remove();
}
