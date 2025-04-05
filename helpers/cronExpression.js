import {sendEmail} from './gmail.js'
import cron from 'node-cron';

export function generateCronExpression(option, days = [], date = null, time = null) {
    if (!time) {
      throw new Error("Time parameter is required.");
    }
  
    // Parse time into hours and minutes
    const [hour, minute] = time.split(':').map(Number);
  
    switch (option) {
      case 1: // Weekly (specific days)
        if (!Array.isArray(days) || days.length === 0) {
          throw new Error("Days parameter is required as an array for option 1.");
        }
        const daysStr = days.join(','); // Join days into a comma-separated string
        return `${minute} ${hour} * * ${daysStr}`;
  
      case 2: // Daily
        return `${minute} ${hour} * * *`;
  
      case 3: // Specific Date
        if (!date) {
          throw new Error("Date parameter is required for option 3.");
        }
        const [year, month, day] = date.split('-').map(Number);
        return `${minute} ${hour} ${day} ${month} *`;
  
      default:
        throw new Error("Invalid option. Choose 1, 2, or 3.");
    }
  }

  // Schedule Email Based on Cron Expression
export function scheduleEmail(cronExpression, userEmail, subject) {
    const task = cron.schedule(cronExpression, () => {
      console.log("Cron triggered. Sending email...");
      sendEmail(userEmail, subject)
        .then(() => console.log("Email sent successfully."))
        .catch((err) => console.error("Failed to send email:", err));
    });
    return task;
  }

