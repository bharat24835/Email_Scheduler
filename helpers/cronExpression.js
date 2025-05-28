import { sendEmail } from "./gmail.js";
import cron from "node-cron";
import { updateCountBasedOnEmail, updateValidEmail } from "./updateDatabse.js";

export function generateCronExpression(option, days = [], date = null) {
  // Fixed time: 10:30 AM
  const hour = 2;
  const minute = 25;

  // switch (option) {
  //   case 1: // Weekly (specific days)
  //     if (!Array.isArray(days) || days.length === 0) {
  //       throw new Error("Days parameter is required as an array for option 1.");
  //     }
  //     const daysStr = days.join(','); // Join days into comma-separated format (e.g., "1,3,5")
  //     return `${minute} ${hour} * * ${daysStr}`;

  //   case 2: // Daily
  //     return `${minute} ${hour} * * *`;

  //   case 3: // Specific Date
  //     if (!date) {
  //       throw new Error("Date parameter is required for option 3.");dw
  //     }
  //     const [day, month, year] = date.split('-').map(Number); // expecting dd-mm-yyyy
  //     return `${minute} ${hour} ${day} ${month} *`;

  //   default:
  //     throw new Error("Invalid option. Choose 1, 2, or 3.");
  // }
  return "10 * * * * *";
}

// Schedule Email Based on Cron Expression
export const scheduleEmail = (cronExpression, emailBatch) => {
  try {
    const task = cron.schedule(cronExpression, () => {
      console.log(
        `⏰ Cron triggered for "${cronExpression}" - sending batch emails with delay...`
      );

      let index = 0;

      const intervalId = setInterval(() => {
        if (index >= emailBatch.length) {
          clearInterval(intervalId);

          // 🔥 Stop and clean up the cron task
          task.stop();
          console.log(
            `✅ Cron task for "${cronExpression}" completed and stopped.`
          );

          

          return;
        }

        const { email, subject } = emailBatch[index];

        sendEmail(email, subject)
          .then(() => {
            console.log(`📧 Email sent to ${email}`);
            updateCountBasedOnEmail(email);
          })
          .catch((err) => {
            console.error(`❌ Failed to send email to ${email}:`, err);
            updateValidEmail(email);
          });

        index++;
      }, 1000); // 1 second delay between each email
    });

    return task;
  } catch (err) {
    console.log("⚠️ Failed to schedule cron task:", err);
  }
};
