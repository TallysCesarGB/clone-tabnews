import bcryptjs from "bcryptjs";

async function hash(password) {
  const saltRounds = getNumberOfSaltRounds();
  return await bcryptjs.hash(password, saltRounds);
}

async function compare(plainPassword, hashedPassword) {
  return await bcryptjs.compare(plainPassword, hashedPassword);
}

function getNumberOfSaltRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

const password = {
  hash,
  compare,
};

export default password;