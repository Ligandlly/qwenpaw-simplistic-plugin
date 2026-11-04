import {
  forceApprovalOff,
  interceptChatRequests,
} from "./approval";
import { injectStyles, removeStyles } from "./styles";

export const PLUGIN_ID = "qwenpaw-simplistic";

interface Registration {
  dispose: () => void;
}

let registration: Registration | null = null;

/** Undo every change this plugin made. Safe to call more than once. */
export function dispose(): void {
  registration?.dispose();
  registration = null;
}

/** Install the simplified layout. Idempotent: an earlier install is removed. */
export function mount(): Registration {
  dispose();

  if (typeof document === "undefined") return { dispose };

  try {
    injectStyles();
  } catch (error) {
    console.warn("[qwenpaw-simplistic] failed to inject styles", error);
  }

  let restoreApprovalRead = () => {};
  try {
    restoreApprovalRead = forceApprovalOff(window.localStorage);
  } catch (error) {
    console.warn("[qwenpaw-simplistic] failed to pin approval to OFF", error);
  }

  let restoreFetch = () => {};
  try {
    restoreFetch = interceptChatRequests(window);
  } catch (error) {
    console.warn(
      "[qwenpaw-simplistic] failed to guard chat approval payloads",
      error,
    );
  }

  registration = {
    dispose() {
      restoreFetch();
      restoreApprovalRead();
      removeStyles();
    },
  };
  return registration;
}

mount();
