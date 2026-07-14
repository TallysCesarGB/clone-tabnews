import orchestrator from "test/orchestrator.js";
import setCookieParser from "set-cookie-parser";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.resetDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/sessions", () => {
  describe("Default user", () => {
    test("With noexistent token", async () => {
      const nonexistentToken =
        "341604f6e0d0c56181535afbe6573995ec178e209d5bf19d882620d3749fd2c7";

      const response = await fetch(`http://localhost:3000/api/v1/sessions`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid session token.",
        action: "Please login again.",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRES_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser();

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(`http://localhost:3000/api/v1/sessions`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid session token.",
        action: "Please login again.",
        status_code: 401,
      });
    });

    test("With validate session", async () => {
      const createdUser = await orchestrator.createUser();

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(`http://localhost:3000/api/v1/sessions`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: sessionObject.id,
        user_id: sessionObject.user_id,
        token: sessionObject.token,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        expires_at: responseBody.expires_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(
        responseBody.expires_at < sessionObject.expires_at.toISOString(),
      ).toBe(true);
      expect(
        responseBody.updated_at > sessionObject.updated_at.toISOString(),
      ).toBe(true);

      // Set-Cookie assertions
      const parsedCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        httpOnly: true,
        path: "/",
      });

      // Double check assertion
      const sessionObjectAfterDelete = await fetch(
        `http://localhost:3000/api/v1/user`,
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(sessionObjectAfterDelete.status).toBe(401);

      const responseBodyAfterDelete = await sessionObjectAfterDelete.json();

      expect(responseBodyAfterDelete).toEqual({
        name: "UnauthorizedError",
        message: "Invalid session token.",
        action: "Please login again.",
        status_code: 401,
      });
    });
  });
});
