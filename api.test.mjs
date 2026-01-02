import axios from "axios";

// ---------------- MOCK axios.get FOR DEPENDENCIES ----------------
// This mock affects ONLY internal calls made by the server
axios.get = async (url) => {
  // mock external endpoint checks
  if (!url.includes("localhost:9607")) {
    return {
      data: true,
      status: 200,
    };
  }

  // allow real request to the Express server
  return axios.request({
    method: "get",
    url,
  });
};

// ---------------- START SERVER ----------------
import "./index.mjs";

// ---------------- RUN TEST ----------------
setTimeout(async () => {
  try {
    const response = await axios.get("http://localhost:9607/isServerOnline");

    console.log("Status:", response.status);
    console.log("Body:", response.data);

    console.assert(response.status === 200, "❌ Expected status code 200");

    console.assert(
      response.data.message === "All servers are online",
      "❌ Expected all servers online message"
    );

    console.assert(
      Array.isArray(response.data.results),
      "❌ Results should be an array"
    );

    console.assert(
      response.data.results.every((r) => r.status === "online"),
      "❌ Not all servers are online"
    );

    console.log("✅ TEST PASSED");
    process.exit(0);
  } catch (error) {
    console.error("❌ TEST FAILED");
    console.error(error.message);
    process.exit(1);
  }
}, 1000); // wait for server startup
