import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";

const baseHttpEmailURL = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) throw Error();
    }
  }

  async function waitForEmailServer() {
    return retry(fetchEmailPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchEmailPage() {
      const response = await fetch(baseHttpEmailURL);

      if (response.status !== 200) throw Error();
    }
  }
}

async function resetDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject = {}) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "defaultPassword123",
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${baseHttpEmailURL}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${baseHttpEmailURL}/messages`);
  const emailResponseBody = await emailListResponse.json();
  const lastEmail = emailResponseBody.pop();

  if(!lastEmail) {
    return null;
  }

  const emailBodyResponse = await fetch(
    `${baseHttpEmailURL}/messages/${lastEmail.id}.plain`,
  );
  const emailBodyText = await emailBodyResponse.text();

  lastEmail.text = emailBodyText;
  return lastEmail;
}

const orchestratorObj = {
  waitForAllServices,
  resetDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
};

export default orchestratorObj;
