import express from "express";
import bodyParser from "body-parser";
import nodeCron from "node-cron";
import { backupModule, callDatabaseData } from "./backup.mjs";

// ---------------- SETUP ----------------
const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.json());

// Run daily at 23:59
const timeofNextBackup = "59 23 * * *";


// ---------------- HELPERS ----------------
const isLastDayOfMonth = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return tomorrow.getDate() === 1;
};

// ---------------- CRON JOB ----------------
const startBackupCronJob = () => {
  console.log("Starting month-end backup cron job...");
  nodeCron.schedule(timeofNextBackup, async () => {
    try {
      if (!isLastDayOfMonth()) {
        console.log("Not month-end — skipping backup.");
        return;
      }
      console.log("Running MONTH-END backup...");
      const databaseData = await callDatabaseData("production");
      if (!databaseData) {
        console.log("Could not fetch database data for backup.");
        return;
      }
      const isBackupSuccess = await backupModule(
        databaseData,
        "production"
      );
      console.log(
        isBackupSuccess
          ? "Month-end backup completed successfully."
          : "Month-end backup failed."
      );
    } catch (error) {
      console.error("Cron execution error:", error.message);
    }
  });
};

// ---------------- INITIALIZE ----------------
(() => {
  startBackupCronJob();
})();

// ---------------- KEEP PROCESS ALIVE (Railway) ----------------
const PORT = process.env.PORT || 3000;


server.listen(PORT, () => {
  console.log(`Background cron server is running on port ${PORT}`);
});
