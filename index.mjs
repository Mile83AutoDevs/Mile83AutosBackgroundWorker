// ----------- DEFINE MODULES ----------------------
import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import { api_endpoint_url } from "./endpoints.mjs";

// ---------------- SETUP/ MIDDLEWARE ----------------
const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.json());

// ---------------- BACKGROUND WORKER FUNCTION ----------------
const _startBackgroundWorker = async () => {
  try {
    console.log("Starting background worker to check server health...");
    await Promise.all(
      api_endpoint_url.map(async (endpointurl, i) => {
        try {
          const response = await axios.get(endpointurl);
          if (response?.data) {
            console.log(`Metric:: ${i + 1} Server is Online`);
          } else {
            console.log(`Metric:: ${i + 1} Server is Offline`);
          }
        } catch {
          console.log(`Metric:: ${i + 1} Server is Offline`);
        }
      }),
    );
  } catch (error) {
    console.log(`failed to connect server: ${error.message}`);
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
          return {
            server: i + 1,
            status: "offline",
          };
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
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// ---------------- INITIALIZE BACKGROUND WORKER & CRON JOBS:: Run Background Jobs at interval every 2ms/hour ----------------
_startBackgroundWorker();

// ---------------- START SERVER ----------------
server.listen(9607 || process.env.PORT, () => {
  console.log("Background cron server is running on port 9607");
});
