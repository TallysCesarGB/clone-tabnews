import email from "infra/email.js";

async function sendEmailToUser(user){
  await email.send({
    from: "TallysCesar <contato@email.com>",
    to: user.email,
    subject: "Activate your account",
    text: `Hello ${user.username},\n\nPlease click the link below to activate your account:\n\nhttp://localhost:3000/activate/${user.activation_token}\n\nThank you!`,
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;