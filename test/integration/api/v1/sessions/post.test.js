import orchestrator from "test/orchestrator.js";
import setCookieParser from "set-cookie-parser";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.resetDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorret email but correct password", async () => {
      await orchestrator.createUser({
        password: "correctPassword",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorret.email@email.com",
          password: "correctPassword",
        }),
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password",
        action: "Please check your credentials and try again",
        status_code: 401,
      });
    });

    test("With correct email but incorrect password", async () => {
      await orchestrator.createUser({
        email: "correct.email@email.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct.email@email.com",
          password: "incorrectPassword",
        }),
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password",
        action: "Please check your credentials and try again",
        status_code: 401,
      });
    });

    test("With incorrect email and incorrect password", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect.email@email.com",
          password: "incorrectPassword",
        }),
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password",
        action: "Please check your credentials and try again",
        status_code: 401,
      });
    });

    test("With correct email and correct password", async () => {
      const createdUser = await orchestrator.createUser({
        email: "correctEmail@email.com",
        password: "correctPassword",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correctEmail@email.com",
          password: "correctPassword",
        }),
      });
      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody.newSession).toEqual({
        id: responseBody.newSession.id,
        token: responseBody.newSession.token,
        user_id: createdUser.id,
        created_at: responseBody.newSession.created_at,
        updated_at: responseBody.newSession.updated_at,
        expires_at: responseBody.newSession.expires_at,
      });

      expect(uuidVersion(responseBody.newSession.id)).toBe(4);
      expect(Date.parse(responseBody.newSession.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.newSession.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.newSession.updated_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.newSession.expires_at);
      const createdAt = new Date(responseBody.newSession.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(session.EXPIRES_IN_MILLISECONDS);

      const parsedCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.newSession.token,
        maxAge: session.EXPIRES_IN_MILLISECONDS / 1000,
        httpOnly: true,
        path: "/",
        sameSite: "Strict",
      });
    });
  });
});
