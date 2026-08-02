import { version as uuidVersion } from "uuid";
import orchestrator from "test/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.resetDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      await orchestrator.createUser({
        username: "CaseMatchUser",
        email: "casematchuser@email.com",
        password: "password123",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/CaseMatchUser",
      );

      expect(response2.status).toBe(200);

      const newUser = await response2.json();

      expect(newUser).toEqual({
        id: newUser.id,
        username: "CaseMatchUser",
        email: "casematchuser@email.com",
        features: ["read:activation_token"],
        password: newUser.password,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      });

      expect(uuidVersion(newUser.id)).toBe(4);
      expect(Date.parse(newUser.created_at)).not.toBeNaN();
      expect(Date.parse(newUser.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      await orchestrator.createUser({
        username: "DifferentCase",
        email: "differentcase@email.com",
        password: "password123",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/differentcase",
      );

      expect(response2.status).toBe(200);

      const newUser = await response2.json();

      expect(newUser).toEqual({
        id: newUser.id,
        username: "DifferentCase",
        email: "differentcase@email.com",
        features: ["read:activation_token"],
        password: newUser.password,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      });

      expect(uuidVersion(newUser.id)).toBe(4);
      expect(Date.parse(newUser.created_at)).not.toBeNaN();
      expect(Date.parse(newUser.updated_at)).not.toBeNaN();
    });

    test("With nonexistent usernema", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistentuser",
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
  });
});
