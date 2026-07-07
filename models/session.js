import crypto from "node:crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "../infra/errors";

const EXPIRES_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 days

async function findOneValidByToken(sessionToken) {
  const sessioFound = await runSelectQuery(sessionToken);
  return sessioFound;

  async function runSelectQuery(sessionToken) {
    const result = await database.query({
      text: `
        SELECT 
          *
        FROM 
          sessions
        WHERE 
          token = $1 AND expires_at > NOW()
        LIMIT
          1
      ;`,
      values: [sessionToken],
    });
    if (result.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Invalid session token.",
        action: "Please login again.",
      });
    }

    return result.rows[0];
  }
}

async function create(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRES_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const result = await database.query({
      text: `
        INSERT INTO 
          sessions (token, user_id, expires_at)
        VALUES 
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [token, userId, expiresAt],
    });
    return result.rows[0];
  }
}

async function renew(sessionId) {
  const newExpiresAt = new Date(Date.now() + EXPIRES_IN_MILLISECONDS);

  const renewedSession = await runUpdateQuery(sessionId, newExpiresAt);
  return renewedSession;

  async function runUpdateQuery(sessionId, newExpiresAt) {
    const result = await database.query({
      text: `
        UPDATE 
          sessions
        SET 
          expires_at = $1,
          updated_at = NOW()
        WHERE 
          id = $2
        RETURNING
          *
      ;`,
      values: [newExpiresAt, sessionId],
    });
    return result.rows[0];
  }
}

const session = {
  create,
  EXPIRES_IN_MILLISECONDS,
  findOneValidByToken,
  renew,
};

export default session;
