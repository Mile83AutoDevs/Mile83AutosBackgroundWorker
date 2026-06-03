import dotenv from "dotenv";
import { backupModule, callDatabaseData } from "./functionsModule.mjs";

dotenv.config({
  quiet: true,
});

// ---------------- FUNCTION TO RUN BACKUP WORKER ----------------
const runBackup = async () => {
  console.log("Starting daily backup...");
  try {
    const databaseData = await callDatabaseData("production");
    if (!databaseData) {
      const msg = "Backup failed: Could not fetch database data.";
      console.log(msg);
    }
    const isBackupSuccess = await backupModule(databaseData, "production");
    const msg = isBackupSuccess.status
      ? `DATA BACKUP SERVER ::  Daily backup completed successfully., Here is your report: ${isBackupSuccess.data_report || null}`
      : "DATA BACKUP SERVER ::  Daily backup failed.";
    console.log(msg);
  } catch (error) {
    const msg = `Backup execution error: ${error.message}`;
    console.error(msg);
  }
};

export { runBackup };
