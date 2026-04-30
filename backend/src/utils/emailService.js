const nodemailer = require("nodemailer");

const isEmailEnabled = () => {
  return (
    process.env.ENABLE_EMAILS === "true" &&
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const buildEmailHtml = ({ title, message, reason, actionText }) => {
  return `
    <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:620px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;">
          <div style="background:#0f172a;padding:24px;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:32px;">
              SmartMeal
            </h1>
            <p style="margin:6px 0 0;color:#cbd5e1;font-size:14px;">
              Homemade Food Delivery Marketplace
            </p>
          </div>

          <div style="padding:28px;">
            <h2 style="margin:0 0 14px;color:#0f172a;font-size:22px;line-height:30px;">
              ${title}
            </h2>

            <p style="margin:0;color:#475569;font-size:15px;line-height:26px;">
              ${message}
            </p>

            ${
              reason
                ? `
                  <div style="margin-top:20px;padding:16px;background:#fef2f2;border:1px solid #fecaca;border-radius:18px;">
                    <p style="margin:0 0 6px;color:#991b1b;font-size:13px;font-weight:700;">
                      Reason
                    </p>
                    <p style="margin:0;color:#b91c1c;font-size:14px;line-height:24px;">
                      ${reason}
                    </p>
                  </div>
                `
                : ""
            }

            ${
              actionText
                ? `
                  <div style="margin-top:22px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;">
                    <p style="margin:0;color:#475569;font-size:14px;line-height:24px;">
                      ${actionText}
                    </p>
                  </div>
                `
                : ""
            }

            <p style="margin:28px 0 0;color:#64748b;font-size:13px;line-height:22px;">
              This is an automated notification from SmartMeal. Please login to your account for full details.
            </p>
          </div>
        </div>

        <p style="margin:18px 0 0;text-align:center;color:#94a3b8;font-size:12px;">
          © SmartMeal. Local homemade food marketplace.
        </p>
      </div>
    </div>
  `;
};

const sendSmartMealEmail = async ({ to, subject, title, message, reason, actionText }) => {
  try {
    if (!to) {
      console.warn("Email skipped: recipient email missing.");
      return {
        sent: false,
        reason: "Recipient email missing.",
      };
    }

    if (!isEmailEnabled()) {
      console.warn("Email skipped: SMTP is not configured or ENABLE_EMAILS is not true.");
      return {
        sent: false,
        reason: "SMTP not configured.",
      };
    }

    const transporter = createTransporter();

    const fromName = process.env.SMTP_FROM_NAME || "SmartMeal";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: `${title}\n\n${message}${reason ? `\n\nReason: ${reason}` : ""}`,
      html: buildEmailHtml({
        title,
        message,
        reason,
        actionText,
      }),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("SmartMeal email sent:", {
      to,
      subject,
      messageId: info.messageId,
    });

    return {
      sent: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("SmartMeal email failed:", error.message);

    return {
      sent: false,
      reason: error.message,
    };
  }
};

const sendChefApprovedEmail = async (chef) => {
  return sendSmartMealEmail({
    to: chef.email,
    subject: "Your SmartMeal chef account has been approved",
    title: "Chef account approved",
    message:
      "Good news! Your SmartMeal chef account has been approved by admin. You can now manage your meals and receive customer orders.",
    actionText:
      "Next step: login to your chef dashboard, complete your profile, upload real meal photos, and keep your local service area updated.",
  });
};

const sendChefRejectedEmail = async (chef, rejectionReason) => {
  return sendSmartMealEmail({
    to: chef.email,
    subject: "Your SmartMeal chef account was rejected",
    title: "Chef account rejected",
    message:
      "Your SmartMeal chef account was reviewed by admin, but it could not be approved at this time.",
    reason: rejectionReason || "No reason provided.",
    actionText:
      "Please update your profile details, CNIC / ID image, address, specialty, and service area before requesting review again.",
  });
};

const sendMealApprovedEmail = async (chef, meal) => {
  return sendSmartMealEmail({
    to: chef.email,
    subject: "Your SmartMeal meal listing has been approved",
    title: "Meal listing approved",
    message: `${meal.name} has been approved by admin and is now visible to customers in the SmartMeal marketplace.`,
    actionText:
      "Keep your meal photo, price, availability, and preparation details accurate for local customers.",
  });
};

const sendMealRejectedEmail = async (chef, meal, moderationNote) => {
  return sendSmartMealEmail({
    to: chef.email,
    subject: "Your SmartMeal meal listing was rejected",
    title: "Meal listing rejected",
    message: `${meal.name} was reviewed by admin but could not be approved for public listing.`,
    reason: moderationNote || "No reason provided.",
    actionText:
      "Please edit the meal listing with a real prepared meal photo, clear description, correct price, and submit it again.",
  });
};

const sendMealRemovedEmail = async (chef, meal) => {
  return sendSmartMealEmail({
    to: chef.email,
    subject: "Your SmartMeal meal listing was removed",
    title: "Meal listing removed",
    message: `${meal.name} was removed by admin because it did not meet marketplace standards.`,
    actionText:
      "You can create a new listing with original food photos, accurate details, and proper availability.",
  });
};

module.exports = {
  sendSmartMealEmail,
  sendChefApprovedEmail,
  sendChefRejectedEmail,
  sendMealApprovedEmail,
  sendMealRejectedEmail,
  sendMealRemovedEmail,
};