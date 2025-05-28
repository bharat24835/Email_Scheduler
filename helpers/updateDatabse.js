import Employee from "../models/employeeModel.js";
import { activeCrons } from "../data/activeTasks.js";
import creds from "../service-account.json" with { type: "json" };
import { GoogleSpreadsheet } from "google-spreadsheet";
import { generateCronExpression } from "./cronExpression.js";
import dotenv from "dotenv";
import { createJobs } from "./cronHelpers.js";
dotenv.config();

export const updateDatabaseController = async () => {
  try {
    // 1. Stop and clear all active cron jobs
    activeCrons.forEach((job) => job.stop());
    activeCrons.length = 0;

    // 2. Load the Google Sheet
    const doc = new GoogleSpreadsheet(
      process.env.GoogleSheetID
    );
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // 3. Clear old Employee records
    await Employee.deleteMany({});

    // 4. Loop through rows
    for (const row of rows) {
      // 🧠 Normalize row keys (e.g., remove extra spaces, lowercase keys)
      const normalized = {};
      Object.keys(row).forEach((key) => {
        const cleanKey = key.trim().toLowerCase();
        normalized[cleanKey] =
          typeof row[key] === "string" ? row[key].trim() : row[key];
      });

      const email = normalized["email"];
      const isSendAllowed = normalized["issendallowed"];
      const isValidEmail = normalized["isvalidemail"];
      const count = normalized["count"];
      const date = normalized["date"];
      const days = row["Days"];
      const cronDays = parseDaysToCronNumbers(days);

      // ❌ Skip if email is missing or invalid
      if (!isSendToday(email , isSendAllowed , isValidEmail,count ,  getOptionType(normalized["option"])  ,cronDays , row["Date"]  ) ) {
        console.warn(`⛔ Skipping row: invalid email [${email}]`.bgYellow);
        console.log(`email is :- ${email} and isSendAllowed :- ${isSendAllowed} and isValidEmail :- ${isValidEmail} and count is :- ${count} and Options is :- ${normalized["option"]}  and Days are :- ${days} and Date is  :- ${date}`)
        continue;
      }

     
      
      try {
        await Employee.create({
          email,
          companyName: normalized["company name"] || "",
          designation: normalized["designation"] || "Developer",
          count: parseInt(normalized["count"]) || 10,
          isSendAllowed: normalized["issendallowed"] === "Yes",
          isValidEmail: normalized["isvalidemail"] === "Yes",
          // cronExpression: generateCronExpression(
          //   getOptionType(row["Option"]),
          //   cronDays,
          //   row["Date"]
          // ), 
          // cronExpression : "30 10 * * *"
          cronExpression : "10 * * * * *"
          // cronExpression : "15 17 * * *"
        });

        console.log(`✔️ Inserted: ${email}`.bgMagenta);
      } catch (err) {
        console.error(`❌ Failed to insert ${email}:`.bgRed, err.message.bg);
      }
    }

    console.log("✅ Database updated from Google Sheet.".bgGreen);
    createJobs();
  } catch (error) {
    console.error("❌ Failed to update database:", error);
  }
};




export async function updateCountBasedOnEmail(email) {
  try {
    // Step 1: Update MongoDB
    const employee = await Employee.findOne({ email });
    if (!employee) {
      console.warn(`❌ Employee not found in DB: ${email}`);
      return;
    }

    employee.count = Math.max(0, employee.count - 1);

    // If count is now 0, update isSendAllowed
    if (employee.count === 0) {
      employee.isSendAllowed = false;
      console.log(`🚫 Setting isSendAllowed=false in DB for ${email}`);
    }

    await employee.save();
    console.log(`✅ Updated Mongo count for ${email}: ${employee.count}`);

    // Step 2: Update Google Sheet
    const doc = new GoogleSpreadsheet(process.env.GoogleSheetID);
    await doc.useServiceAccountAuth({
      client_email: creds.client_email,
      private_key: creds.private_key,
    });
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const row = rows.find(
      (r) => r.Email?.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (!row) {
      console.warn(`❌ Email not found in Google Sheet: ${email}`);
      return;
    }

    const currentCount = parseInt(row.Count || "0", 10);
    const updatedCount = Math.max(0, currentCount - 1);
    row.Count = updatedCount;

    // If count is now 0, mark isSendAllowed as "No"
    if (updatedCount === 0) {
      row.isSendAllowed = "No";
      row.Count = 5;
      console.log(`🚫 Setting isSendAllowed="No" in Sheet for ${email}`);
    }

    await row.save();

    console.log(`📄 Google Sheet count updated for ${email}: ${row.Count}`);
  } catch (error) {
    console.error(`🔥 updateCountBasedOnEmail failed for ${email}:`, error.message);
  }
}


export async function updateValidEmail(email) {
  try {
    // Step 1: Update MongoDB
    const employee = await Employee.findOne({ email });
    if (!employee) {
      console.warn(`❌ Employee not found in DB: ${email}`);
      return;
    }

    employee.isValidEmail = false;
    await employee.save();
    console.log(`✅ Updated isValidEmail to false in DB for ${email}`);

    // Step 2: Update Google Sheet
    const doc = new GoogleSpreadsheet(
      process.env.GoogleSheetID
    );
    await doc.useServiceAccountAuth({
      client_email: creds.client_email,
      private_key: creds.private_key,
    });
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const row = rows.find(
      (r) => r.Email?.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (!row) {
      console.warn(`❌ Email not found in Google Sheet: ${email}`);
      return;
    }

    row.isValidEmail = "No";
    await row.save();

    console.log(`📄 Marked isValidEmail="No" in Sheet for ${email}`);
  } catch (error) {
    console.error(`🔥 updateValidEmail failed for ${email}:`, error.message);
  }
}

function getOptionType(option) {
  if (!option) return null;

  const normalized = option.trim().toLowerCase();

  if (normalized === "weekly") return 1;
  if (normalized === "daily") return 2;
  if (normalized === "date" || normalized === "specific date") return 3;

  return null; // Unknown or unsupported option
}
function parseDaysToCronNumbers(daysString) {
  if (!daysString) return [];

  const dayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  return daysString
    .split(",")
    .map((day) => day.trim().toLowerCase())
    .map((day) => dayMap[day])
    .filter((num) => num !== undefined) // skip invalid entries
    .sort((a, b) => a - b);
}

export function isSendToday( email ,isSendAllowed ,isValidEmail  , count , option, days = [], date = null) {


  if(!email || email.toLowerCase() === "null" || email === "" || isSendAllowed === "No"  || isValidEmail === "No" || count <=0) { 
    
    return false};
  const today = new Date();
  const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // 1. Daily
  if (option === 2) {
    return true;
  } 

  // 2. Weekly
  if (option === 1) {
    return days.includes(todayDay);
  }

  // 3. Specific Date
  if (option === 3 && date) {
    const [day, month, year] = date.split("-").map(Number); // e.g. "27-06-2025"
    const targetDate = new Date(year, month - 1, day); // month is 0-indexed

    return (
      today.getFullYear() === targetDate.getFullYear() &&
      today.getMonth() === targetDate.getMonth() &&
      today.getDate() === targetDate.getDate()
    );
  }

  return false;
}


