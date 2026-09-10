import { renderHook } from "@testing-library/react";
import useSyncCurrentUserId from "./useSyncCurrentUserId";
import { setCurrentUser } from "../utils/apiCallHandler";

vi.mock("../utils/apiCallHandler", () => ({
  setCurrentUser: vi.fn(),
}));

describe("useSyncCurrentUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets the current user from the access token and OIDC subject", () => {
    const user = {
      access_token: "token-123",
      profile: { sub: "sub-1", user: "user-1" },
    };

    renderHook(() => useSyncCurrentUserId(user));

    expect(setCurrentUser).toHaveBeenCalledWith("token-123", "sub-1");
  });

  it("falls back to profile.user when sub is missing", () => {
    const user = { access_token: "token-123", profile: { user: "user-1" } };

    renderHook(() => useSyncCurrentUserId(user));

    expect(setCurrentUser).toHaveBeenCalledWith("token-123", "user-1");
  });

  it("clears the current user when logged out", () => {
    renderHook(() => useSyncCurrentUserId(null));

    expect(setCurrentUser).toHaveBeenCalledWith(null, null);
  });

  it("re-syncs when the access token changes", () => {
    const { rerender } = renderHook(({ user }) => useSyncCurrentUserId(user), {
      initialProps: {
        user: { access_token: "token-123", profile: { sub: "sub-1" } },
      },
    });

    rerender({
      user: { access_token: "token-456", profile: { sub: "sub-1" } },
    });

    expect(setCurrentUser).toHaveBeenCalledWith("token-456", "sub-1");
  });
});
