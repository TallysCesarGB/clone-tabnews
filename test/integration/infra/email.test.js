import email from "infra/email.js";
import orchestrator from "test/orchestrator.js";

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "TallysCesar <tallyscesargb@gmail.com>",
      to: "<tallyscesardev@gmail.com>",
      subject: "Email sending test",
      text: "Test email body",
    });

    await email.send({
      from: "TallysCesar <tallyscesargb@gmail.com>",
      to: "<tallyscesardev@gmail.com>",
      subject: "Middle Email",
      text: "Test middle email body",
    });

    await email.send({
      from: "TallysCesar <tallyscesargb@gmail.com>",
      to: "<tallyscesardev@gmail.com>",
      subject: "Last Email",
      text: "Test last email body",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<tallyscesargb@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<tallyscesardev@gmail.com>");
    expect(lastEmail.subject).toBe("Last Email");
    expect(lastEmail.text).toBe("Test last email body\n");
  });
});
