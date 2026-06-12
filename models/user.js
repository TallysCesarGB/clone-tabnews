import { ValidationError, NotFoundError } from "infra/errors.js";
import password from "models/password.js";
import database from "infra/database.js";

async function create(userInputValues) {
  await validateUniqueField("username", userInputValues.username);
  await validateUniqueField("email", userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInputValues(userInputValues);
  return newUser;

  async function runInputValues(userInputValues) {
    const results = await database.query({
      text: `
    INSERT INTO 
      users (username, email, password) 
    VALUES 
      ($1, $2, $3)
    RETURNING
      *
    ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function updateByUsername(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if (userInputValues.username) {
    await validateUniqueField("username", userInputValues.username);
  }

  if (userInputValues.email) {
    await validateUniqueField("email", userInputValues.email);
  }

  if (userInputValues.password) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithUpdatedValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdate(userWithUpdatedValues);
  return updatedUser;

  async function runUpdate(userWithUpdatedValues) {
    const results = await database.query({
      text: `
      UPDATE 
        users
      SET 
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
      ;`,
      values: [
        userWithUpdatedValues.id,
        userWithUpdatedValues.username,
        userWithUpdatedValues.email,
        userWithUpdatedValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
      SELECT 
        *
      FROM 
        users
      WHERE 
        LOWER(username) = LOWER($1)
      LIMIT
        1
      ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "User not found",
        action: "Please check the username and try again",
      });
    }

    return results.rows[0];
  }
}

async function findOneByEmail(email) {
  const userFound = await runSelectQuery(email);
  return userFound;

  async function runSelectQuery(email) {
    const results = await database.query({
      text: `
      SELECT 
        *
      FROM 
        users
      WHERE 
        LOWER(email) = LOWER($1)
      LIMIT
        1
      ;`,
      values: [email],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "User not found",
        action: "Please check the email and try again",
      });
    }

    return results.rows[0];
  }
}

async function validateUniqueField(fieldName, fieldValue) {
  const results = await database.query({
    text: `
    SELECT 
      ${fieldName}
    FROM 
      users
    WHERE 
      LOWER(${fieldName}) = LOWER($1)
    ;`,
    values: [fieldValue],
  });
  if (results.rowCount > 0) {
    const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    throw new ValidationError({
      message: `${label} already in use`,
      action: `Please use a different ${fieldName}`,
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const passwordHash = await password.hash(userInputValues.password);
  userInputValues.password = passwordHash;
}

const user = {
  create,
  findOneByUsername,
  updateByUsername,
  findOneByEmail,
};

export default user;
