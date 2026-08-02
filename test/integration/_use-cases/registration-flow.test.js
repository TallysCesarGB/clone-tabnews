import orchestrator from "test/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.resetDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use Case: Registration Flow (all sucessful)", () => {
  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationFlowTestUser",
          email: "registration.flow@email.com",
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    const createUserResponseBody = await createUserResponse.json();
    const user = createUserResponseBody.newUser;

    expect(user).toEqual({
      id: user.id,
      username: "RegistrationFlowTestUser",
      email: "registration.flow@email.com",
      features: ["read:activation_token"],
      password: user.password,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  });

  test("Receive email with verification link", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@email.com>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@email.com>");
    expect(lastEmail.subject).toBe("Activate your account");
    expect(lastEmail.text).toContain("RegistrationFlowTestUser"); 
  });

  test("Activate account by clicking on verification link", async () => {});

  test("Login with activated account", async () => {});

  test("Get user information with valid session", async () => {});
});
