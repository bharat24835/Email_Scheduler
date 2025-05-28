import mongoose from "mongoose";
import cron from "node-cron";
import Employee from "../models/employeeModel.js";
import { activeCrons } from "../data/activeTasks.js";
import creds from "../service-account.json" assert { type: "json" }; //
import { GoogleSpreadsheet } from "google-spreadsheet";
import { generateCronExpression, scheduleEmail } from "./cronExpression.js";

export const createJobs = async () => {
  try {
    const employees = await Employee.find({});
    // Group employees by cron expression
    const cronMap = {}; // { [cronExpression]: [{ email, subject }] }

    for (const employee of employees) {
      const { email, cronExpression, isSendAllowed, isValidEmail, count , designation } =
        employee;

      if (!email || !cronExpression ) continue;

      if (isSendAllowed && isValidEmail && count > 0) {
        const subject = designation === "Developer" ? "Please have to Look to Profile" : "Looking for SDE Job / Internship" ;

        if (!cronMap[cronExpression]) {
          cronMap[cronExpression] = [];
        }

        cronMap[cronExpression].push({ email, subject });
      } else {
        console.log(
          `⛔ Skipped ${email} (isSendAllowed: ${isSendAllowed}, isValidEmail: ${isValidEmail} , count : ${count})`
        );
      }
    }

    // Create cron jobs for each group
    for (const cronExpression in cronMap) {
      const emailBatch = cronMap[cronExpression];
      const task = scheduleEmail(cronExpression, emailBatch);
      activeCrons.push(task);
      console.log(
        `✅ Cron job created for ${emailBatch.length} recipients with expression "${cronExpression}"`
      );
    }
  } catch (err) {
    console.error("❌ Failed to create jobs:", err);
  }
};
