import { afterEach } from "vitest";

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  document.head.innerHTML = "";
  document.body.innerHTML = "";
});
