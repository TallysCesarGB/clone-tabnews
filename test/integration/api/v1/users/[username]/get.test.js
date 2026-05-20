import { version as uuidVersion } from "uuid";
import orchestrator from "test/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.resetDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users", () => {
  describe("Anonymous user", () => {
    // beforeEach(async () => {
    //   await orchestrator.resetDatabase();
    //   await orchestrator.runPendingMigrations();
    // });

    test("With exact case match", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "CaseMatchUser",
          email: "casematchuser@email.com",
          password: "password123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users/CaseMatchUser");

      expect(response2.status).toBe(200);

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
