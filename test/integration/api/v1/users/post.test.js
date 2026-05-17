import { version as uuidVersion } from "uuid";
import orchestrator from "test/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.resetDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
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
        password: "password123",
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      });
      expect(uuidVersion(newUser.id)).toBe(4);
      expect(Date.parse(newUser.created_at)).not.toBeNaN();
      expect(Date.parse(newUser.updated_at)).not.toBeNaN();
    });
  });
});
