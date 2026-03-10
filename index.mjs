// ----------- DEFINE MODULES ----------------------
import dotenv from "dotenv";
import axios from "axios";
import express from "express";
import { api_endpoint_url } from "./endpoints.mjs";
import DiscordPipeline from "./discord.pipeline.mjs";

// ---------- CONFIGURE ENVIRONMENT VARIABLE ----------
dotenv.config({ quiet: false });

// ---------------- SETUP / MIDDLEWARE ----------------
const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// --------------- DEFINE PIPELINE ------------------------
const _discord_pipe = new DiscordPipeline();

// ---------------- HELPER: SLEEP ----------------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------- HELPER: SEND DISCORD MESSAGE WITH RETRY ----------------
const sendDiscordMessage = async (message, retries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await _discord_pipe.sendMessage(message);
      return; // success
    } catch (err) {
      console.log(`Discord send attempt ${attempt} failed: ${err.message}`);
      if (attempt < retries) {
        await sleep(delay);
      } else {
        console.log(
          `Failed to send Discord message after ${retries} attempts: ${message}`,
        );
      }
    }
  }
};

// ---------------- BACKGROUND WORKER FUNCTION ----------------
const _startBackgroundWorker = async () => {
  try {
    console.log("Starting background worker to check server health...");

    // Sequentially check each endpoint to add delay between Discord messages
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

      // Send to Discord with retry
      await sendDiscordMessage(message);

      console.log(message);

      // Delay before sending next message (e.g., 1 second)
      await sleep(1000);
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
_startBackgroundWorker();
setInterval(
  () => {
    _startBackgroundWorker().catch((err) =>
      console.log("Worker caught error:", err),
    );
  },
  2 * 60 * 1000,
); // 3 seconds interval for testing

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 9607;
server.listen(PORT, () => {
  console.log(`Background cron server is running on port ${PORT}`);
});
