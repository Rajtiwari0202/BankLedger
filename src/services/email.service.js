require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"BankLedger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to BankLedger";

  const text = `Hello ${name},

Thank you for registering at BankLedger. We're excited to have you on board.

Best Regards,
The BankLedger Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Welcome to BankLedger</h2>

      <p>Hello ${name},</p>

      <p>
        Thank you for registering at BankLedger.
        We're excited to have you on board.
      </p>

      <p>
        Best Regards,<br/>
        The BankLedger Team
      </p>
    </div>
  `;

  return await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const formattedAmount = formatCurrency(amount);

  const subject = "Transaction Successful";

  const text = `Hello ${name},

Your transaction has been processed successfully.

Amount: ${formattedAmount}
Transferred To: ${toAccount}

Thank you for using BankLedger.

Regards,
BankLedger Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Transaction Confirmation</h2>

      <p>Hello ${name},</p>

      <p>Your transaction has been processed successfully.</p>

      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>Amount</strong>
          </td>

          <td style="padding: 8px; border: 1px solid #ddd;">
            ${formattedAmount}
          </td>
        </tr>

        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>Transferred To</strong>
          </td>

          <td style="padding: 8px; border: 1px solid #ddd;">
            ${toAccount}
          </td>
        </tr>
      </table>

      <p style="margin-top: 20px;">
        Thank you for using BankLedger.
      </p>

      <p>
        Regards,<br/>
        BankLedger Team
      </p>
    </div>
  `;

  return await sendEmail(userEmail, subject, text, html);
}

async function sendFailedTransactionEmail(
  userEmail,
  name,
  amount,
  toAccount,
  reason = "Transaction could not be completed",
) {
  const formattedAmount = formatCurrency(amount);

  const subject = "Transaction Failed";

  const text = `Hello ${name},

Your transaction could not be completed.

Amount: ${formattedAmount}
Transferred To: ${toAccount}
Reason: ${reason}

Regards,
BankLedger Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Transaction Failed</h2>

      <p>Hello ${name},</p>

      <p>Your transaction could not be completed.</p>

      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>Amount</strong>
          </td>

          <td style="padding: 8px; border: 1px solid #ddd;">
            ${formattedAmount}
          </td>
        </tr>

        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>Transferred To</strong>
          </td>

          <td style="padding: 8px; border: 1px solid #ddd;">
            ${toAccount}
          </td>
        </tr>

        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <strong>Reason</strong>
          </td>

          <td style="padding: 8px; border: 1px solid #ddd;">
            ${reason}
          </td>
        </tr>
      </table>

      <p>
        Regards,<br/>
        BankLedger Team
      </p>
    </div>
  `;

  return await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendTransactionEmail,
  sendFailedTransactionEmail,
};
