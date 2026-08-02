import { version as uuidVersion } from "uuid";
import orchestrator from "test/orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.resetDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With nonexistent usernema", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistentuser",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const newUser = await response.json();

      expect(newUser).toEqual({
        name: "NotFoundError",
        message: "User not found",
        action: "Please check the username and try again",
        status_code: 404,
      });
    });

    test("With duplicate username", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      await orchestrator.createUser({
        username: "user2",
      });

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });
      expect(response.status).toBe(400);

      const errorResponse = await response.json();
      expect(errorResponse).toEqual({
        name: "ValidationError",
        message: "Username already in use",
        action: "Please use a different username",
        status_code: 400,
      });
    });

    test("With duplicate email", async () => {
      await orchestrator.createUser({
        email: "email1@email.com",
      });

      const userTemp = await orchestrator.createUser({
        email: "email2@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userTemp.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@email.com",
          }),
        },
      );
      expect(response.status).toBe(400);

      const errorResponse = await response.json();
      expect(errorResponse).toEqual({
        name: "ValidationError",
        message: "Email already in use",
        action: "Please use a different email",
        status_code: 400,
      });
    });

    test("With unique username", async () => {
      const userTemp = await orchestrator.createUser({
        username: "uniqueuser",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueuser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueuser2",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: userTemp.id,
        username: "uniqueuser2",
        email: userTemp.email,
        features: [],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique email", async () => {
      const userTemp = await orchestrator.createUser({
        email: "uniqueemailuser@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userTemp.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueemailuser2@email.com",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: userTemp.username,
        email: "uniqueemailuser2@email.com",
        features: [],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new password", async () => {
      const userTemp = await orchestrator.createUser({
        password: "password123",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userTemp.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newpassword123",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: userTemp.username,
        email: userTemp.email,
        features: [],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(userTemp.username);

      const correctPasswordMatch = await password.compare(
        "newpassword123",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "password123",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
