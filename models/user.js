import { ValidationError } from "infra/errors.js";
import database from "infra/database.js";

async function create(userInputValues) {
  await validateUniqueField("email", userInputValues.email);
  await validateUniqueField("username", userInputValues.username);

  const newUser = await runInputValues(userInputValues);
  return newUser;

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

const user = {
  create,
};

export default user;
