import bcryptjs from "bcryptjs";

async function hash(password) {
  const saltRounds = getNumberOfSaltRounds();
  const pepperedPassword = applyPepper(password);
  return await bcryptjs.hash(pepperedPassword, saltRounds);
}

async function compare(plainPassword, hashedPassword) {
  const pepperedPassword = applyPepper(plainPassword);
  return await bcryptjs.compare(pepperedPassword, hashedPassword);
}

function applyPepper(password) {
  const pepper = process.env.PASSWORD_PEPPER;

  if (!pepper) {
    throw new Error("PASSWORD_PEPPER environment variable is not set");
  }

  return password + pepper;
}

function getNumberOfSaltRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

const password = {
  hash,
  compare,
};

export default password;
