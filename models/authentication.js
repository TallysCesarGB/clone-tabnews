import user from "models/user.js";
import password from "models/password.js";
import { UnautorizedError, NotFoundError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findOneByEmail(providedEmail);
    await validatedPassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw new UnautorizedError({
        message: "Invalid email or password",
        action: "Please check your credentials and try again",
      });
    }
    throw err;
  }

  async function findOneByEmail(providedEmail) {
    let storedUser;

    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (err) {
      if (err instanceof UnautorizedError) {
        throw new UnautorizedError({
          message: "Invalid email or password",
          action: "Please check your credentials and try again",
        });
      }
      throw err;
    }
    return storedUser;
  }

  async function validatedPassword(providedPassword, storedPassword) {
    const passwordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!passwordMatch) {
      throw new UnautorizedError({
        message: "Invalid email or password",
        action: "Please check your credentials and try again",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
