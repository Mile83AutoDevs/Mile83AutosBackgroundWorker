import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import { api_endpoint_url } from "./endpoints.mjs";

// define variables and params ;
const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.json());
const delay = 4000; // 4 seconds ;

// define background worker function ;
const _startBackgroundWorker = async () => {
  try {
    api_endpoint_url.map(async (endpointurl, i) => {
      const response = await axios.get(endpointurl);
      if (response.data) {
        console.log(`Metric::`, i + 1, "Server is Online");
      } else {
        console.log(`Metrics:: ${i + 1} Server is offline`);
      }
    });
  } catch (e) {
    console.log("Something went wrong, could no start url cron job");
  }
};

setInterval(_startBackgroundWorker, delay); // run every 4 seconds ;

// define routes ;
server.get("/isServerOnline", async (req, res) => {
  api_endpoint_url.map(async (endpointurl, i) => {
    try {
      const response = await axios.get(endpointurl);
      if (response.data) {
        console.log(`Metric::`, i + 1, "Server is Online");
        res.status(200).json({ message: "Background worker server is online" });
      } else {
        console.log(`Metrics:: ${i + 1} Server is offline`);
        res.status(500).json({ message: `offline`, server: i + 1 });
      }
    } catch (e) {
      res.status(500).json({ message: "Something went wrong" });
      console.log(`Metrics:: ${i + 1} Server is offline`);
    }
  });
  res.status(200).json({ message: "Background worker server is online" });
});

// make server listen on port 9607 ;
server.listen(9607, async () => {
  console.log("Background cron server is running");
});
