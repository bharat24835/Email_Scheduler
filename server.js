import express from "express";
import colors from "colors";
import connectDB from "./config/DB.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import { updateDatabaseController } from "./helpers/updateDatabse.js";
import cron from "node-cron";
import { createJobs } from "./helpers/cronHelpers.js";

const app = express();

app.use(express.json());
app.use("/password", passwordRoutes);

const port = 8000;

app.listen(port, () => {
  console.log(`Server is listening at PORT ${port}`.bgGreen);
  connectDB();
  cron.schedule("30 3 * * *", () => {
    console.log("🕞 Running updateDatabaseController at 3:30 AM...");
    updateDatabaseController();
  });
});
