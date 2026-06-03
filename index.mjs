// ----------- DEFINE MODULES ----------------------
import dotenv from "dotenv";
import axios from "axios";
import express from "express";
import { api_endpoint_url } from "./endpoints.mjs";
import { runBackup } from "./BackupModule/Scripts/runBackup.mjs";
import bodyParser from "body-parser";

// ---------- CONFIGURE ENVIRONMENT VARIABLE ----------
dotenv.config({ quiet: true });

// ---------------- SETUP / MIDDLEWARE ----------------
const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// ---------------- BACKGROUND WORKER FUNCTION ----------------
const _startBackgroundWorker = async () => {
  try {
    console.log("Starting background worker to check server health...");
    for (let i = 0; i < api_endpoint_url.length; i++) {
      const endpointurl = api_endpoint_url[i];
      let message = "";
      try {
        const response = await axios.get(endpointurl);
        message = response?.data
          ? `ENDPOINT_HEALTH_CHECK_SERVER -> Metric:: ${i + 1} Server is Online`
          : `ENDPOINT_HEALTH_CHECK_SERVER -> Metric:: ${i + 1} Server is Offline`;
      } catch (err) {
        message = `ENDPOINT_HEALTH_CHECK_SERVER -> Metric:: ${i + 1} Server is Offline. Error: ${err.message}`;
      }
      console.log(message);
    }
  } catch (error) {
    console.log(`Background worker failure: ${error.message}`);
  }
};

// ---------------- ROUTES ----------------
server.get("/isServerOnline", async (req, res) => {
  try {
    const results = await Promise.all(
      api_endpoint_url.map(async (endpointurl, i) => {
        try {
          const response = await axios.get(endpointurl);
          return {
            server: i + 1,
            status: response?.data ? "online" : "offline",
          };
        } catch {
          return { server: i + 1, status: "offline" };
        }
      }),
    );
    const hasOffline = results.some((r) => r.status === "offline");
    return res.status(hasOffline ? 500 : 200).json({
      message: hasOffline
        ? "One or more servers are offline"
        : "All servers are online",
      results,
    });
  } catch (error) {
    console.log(`Error in /isServerOnline route: ${error.message}`);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ---------------- INITIALIZE BACKGROUND WORKER & CRON JOBS ----------------
try {
  await _startBackgroundWorker();
  await runBackup();
} catch (err) {
  console.log("Initial worker caught error:", err);
}
