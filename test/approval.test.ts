import { describe, expect, it } from "vitest";
import {
  APPROVAL_STORAGE_PREFIX,
  FORCED_APPROVAL_LEVEL,
  forceApprovalOff,
  forceApprovalOffInRequestBody,
  interceptChatRequests,
} from "../src/approval";

describe("forceApprovalOff", () => {
  it("reports OFF for every chat approval key", () => {
    const restore = forceApprovalOff(window.localStorage);
    try {
      window.localStorage.setItem(`${APPROVAL_STORAGE_PREFIX}s-1`, "STRICT");
      window.localStorage.setItem(`${APPROVAL_STORAGE_PREFIX}s-2`, "JEV");

      expect(window.localStorage.getItem(`${APPROVAL_STORAGE_PREFIX}s-1`)).toBe(
        FORCED_APPROVAL_LEVEL,
      );
      expect(window.localStorage.getItem(`${APPROVAL_STORAGE_PREFIX}s-2`)).toBe(
        "OFF",
      );
    } finally {
      restore();
    }
  });

  it("leaves unrelated keys untouched", () => {
    window.localStorage.setItem("language", "zh-CN");
    window.localStorage.setItem("approval_level", "STRICT");

    const restore = forceApprovalOff(window.localStorage);
    try {
      expect(window.localStorage.getItem("language")).toBe("zh-CN");
      expect(window.localStorage.getItem("approval_level")).toBe("STRICT");
    } finally {
      restore();
    }
  });

  it("restores the original read on dispose", () => {
    window.localStorage.setItem(`${APPROVAL_STORAGE_PREFIX}s-1`, "STRICT");
    const restore = forceApprovalOff(window.localStorage);
    expect(window.localStorage.getItem(`${APPROVAL_STORAGE_PREFIX}s-1`)).toBe(
      "OFF",
    );

    restore();
    expect(window.localStorage.getItem(`${APPROVAL_STORAGE_PREFIX}s-1`)).toBe(
      "STRICT",
    );
  });

  it("does not break removeItem on approval keys", () => {
    const restore = forceApprovalOff(window.localStorage);
    try {
      window.localStorage.setItem(`${APPROVAL_STORAGE_PREFIX}s-1`, "STRICT");
      window.localStorage.removeItem(`${APPROVAL_STORAGE_PREFIX}s-1`);
      expect(window.localStorage.getItem(`${APPROVAL_STORAGE_PREFIX}s-1`)).toBe(
        "OFF",
      );
    } finally {
      restore();
    }
  });

  it("is a no-op when called twice and disposed out of order", () => {
    const first = forceApprovalOff(window.localStorage);
    const second = forceApprovalOff(window.localStorage);
    try {
      expect(window.localStorage.getItem(`${APPROVAL_STORAGE_PREFIX}x`)).toBe(
        "OFF",
      );
    } finally {
      second();
      first();
    }
    expect(window.localStorage.getItem(`${APPROVAL_STORAGE_PREFIX}x`)).toBeNull();
  });
});

describe("forceApprovalOffInRequestBody", () => {
  const body = (approvalLevel?: string) =>
    JSON.stringify({
      input: [{ role: "user", content: [{ type: "text", text: "hi" }] }],
      session_id: "s-1",
      stream: true,
      request_context: {
        ...(approvalLevel ? { approval_level: approvalLevel } : {}),
        user_id: "default",
        agent_id: "default",
      },
    });

  it("replaces the outgoing approval level and keeps the rest of the payload", () => {
    const rewritten = JSON.parse(
      forceApprovalOffInRequestBody(body("AUTO")),
    );
    expect(rewritten.request_context.approval_level).toBe(
      FORCED_APPROVAL_LEVEL,
    );
    expect(rewritten.request_context.agent_id).toBe("default");
    expect(rewritten.session_id).toBe("s-1");
    expect(rewritten.input[0].content[0].text).toBe("hi");
  });

  it("adds OFF when the context omits a level", () => {
    const rewritten = JSON.parse(forceApprovalOffInRequestBody(body()));
    expect(rewritten.request_context.approval_level).toBe("OFF");
  });

  it("leaves bodies without a request context alone", () => {
    const original = JSON.stringify({ model: "x" });
    expect(forceApprovalOffInRequestBody(original)).toBe(original);
  });

  it("leaves invalid JSON alone", () => {
    expect(forceApprovalOffInRequestBody("not json")).toBe("not json");
  });
});

describe("interceptChatRequests", () => {
  it("rewrites only POST chat submissions", async () => {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    const target = {
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({ input, init });
        return {} as Response;
      },
    };
    const restore = interceptChatRequests(target);
    try {
      await target.fetch("http://localhost/api/console/chat", {
        method: "POST",
        body: JSON.stringify({ request_context: { approval_level: "AUTO" } }),
      });
      await target.fetch("http://localhost/api/console/chat", {
        method: "POST",
        body: JSON.stringify({ request_context: { approval_level: "OFF" } }),
      });
      await target.fetch("http://localhost/api/other", {
        method: "POST",
        body: JSON.stringify({ request_context: { approval_level: "AUTO" } }),
      });

      const first = JSON.parse(String(calls[0].init?.body));
      const second = JSON.parse(String(calls[1].init?.body));
      const third = JSON.parse(String(calls[2].init?.body));
      expect(first.request_context.approval_level).toBe("OFF");
      expect(second.request_context.approval_level).toBe("OFF");
      expect(third.request_context.approval_level).toBe("AUTO");
    } finally {
      restore();
    }
  });

  it("restores the original fetch on dispose", async () => {
    const original = async () => ({}) as Response;
    const target = { fetch: original };
    const restore = interceptChatRequests(target);
    expect(target.fetch).not.toBe(original);
    restore();
    expect(target.fetch).toBe(original);
  });
});
