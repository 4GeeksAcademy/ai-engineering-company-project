import {
  ApiHttpError,
  ApiTimeoutError,
  clearAccessToken,
  getAccessToken,
  messageForStatus,
  parseError,
  setAccessToken,
  toUserMessage,
} from "@/lib/apiClient";

describe("access token storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a token in localStorage", () => {
    setAccessToken("jwt-test-token");
    expect(window.localStorage.getItem("healthcore_access_token")).toBe("jwt-test-token");
    expect(getAccessToken()).toBe("jwt-test-token");
  });

  it("returns null when missing and clears the stored key", () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken("jwt-test-token");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
    expect(window.localStorage.getItem("healthcore_access_token")).toBeNull();
  });
});

describe("messageForStatus", () => {
  it("maps known HTTP statuses to user copy", () => {
    expect(messageForStatus(401)).toBe("Please sign in again, or check your email and password.");
    expect(messageForStatus(403)).toBe("You do not have permission to do that.");
    expect(messageForStatus(404)).toBe("We could not find that resource.");
    expect(messageForStatus(422)).toBe("Please check the highlighted fields and try again.");
    expect(messageForStatus(500)).toBe("Something went wrong on our side. Please try again.");
  });

  it("uses a generic fallback without exposing the status code", () => {
    const message = messageForStatus(418);
    expect(message).toBe("Something went wrong. Please try again.");
    expect(message).not.toContain("418");
  });
});

describe("toUserMessage and parseError", () => {
  it("maps ApiHttpError and ApiTimeoutError to user sentences", () => {
    expect(toUserMessage(new ApiHttpError(messageForStatus(401), 401))).toBe(
      "Please sign in again, or check your email and password.",
    );
    expect(toUserMessage(new ApiTimeoutError())).toBe("The request took too long. Please try again.");
  });

  it("never surfaces raw Error.message or API detail", async () => {
    const fromThrown = toUserMessage(new Error("SECRET leaked"));
    expect(fromThrown).toBe("Something went wrong. Please try again.");
    expect(fromThrown).not.toContain("SECRET leaked");

    const response = {
      status: 500,
      json: async () => ({ detail: "SECRET leaked" }),
    } as Response;
    await expect(parseError(response)).rejects.toBeInstanceOf(ApiHttpError);
    try {
      await parseError(response);
    } catch (err) {
      const message = toUserMessage(err);
      expect(message).toBe("Something went wrong on our side. Please try again.");
      expect(message).not.toContain("SECRET leaked");
      expect(String(err)).not.toContain("SECRET leaked");
    }
  });
});
