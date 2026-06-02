import { version as uuidVersion } from "uuid";
import orchestrator from "test/orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.resetDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    beforeEach(async () => {
      await orchestrator.resetDatabase();
      await orchestrator.runPendingMigrations();
    });

    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Tata",
          email: "tata@email.com",
          password: "password123",
        }),
      });
      expect(response.status).toBe(201);

      const { newUser } = await response.json();
      expect(newUser).toEqual({
        id: newUser.id,
        username: "Tata",
        email: "tata@email.com",
        password: newUser.password,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      });
      expect(uuidVersion(newUser.id)).toBe(4);
      expect(Date.parse(newUser.created_at)).not.toBeNaN();
      expect(Date.parse(newUser.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("Tata");
      
      const correctPasswordMatch = await password.compare(
        "password123",
        userInDatabase.password,
      );
      
      const incorrectPasswordMatch = await password.compare(
        "badPassword",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicate email", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateEmailUser1",
          email: "duplicate@email.com",
          password: "password123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateEmailUser2",
          email: "Duplicate@email.com",
          password: "password123",
        }),
      });
      expect(response2.status).toBe(400);

      const errorResponse = await response2.json();
      expect(errorResponse).toEqual({
        name: "ValidationError",
        message: "Email already in use",
        action: "Please use a different email",
        status_code: 400,
      });
    });

    test("With duplicate username", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateUser1",
          email: "duplicate1@email.com",
          password: "password123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateUser1",
          email: "Duplicate@email.com",
          password: "password123",
        }),
      });
      expect(response2.status).toBe(400);

      const errorResponse = await response2.json();
      expect(errorResponse).toEqual({
        name: "ValidationError",
        message: "Username already in use",
        action: "Please use a different username",
        status_code: 400,
      });
    });
  });
});
