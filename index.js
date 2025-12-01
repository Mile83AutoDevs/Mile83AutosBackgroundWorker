const axiosModule = require("axios");
const delay = 4000;

const _startBackgroundWorker = async () => {
  const api_endpoint_url = [
    "https://mile83autos-api-backend-1.onrender.com/api/v1/checkServerHealth",
    "https://mileautosainode.vercel.app/Mile83LLMModel/api/v1/isAIServerOnline",
  ];

  try {
    api_endpoint_url.map(async (endpointurl, i) => {
      const response = await axiosModule.get(endpointurl);
      if (response) {
        console.log(`Server responded :: ${new Date().toISOString()} `);
        console.log(`Metric::`, response.data);
      }
    });
  } catch (e) {
    console.log("Something went wrong, could no start url cron job");
  }
};

setInterval(_startBackgroundWorker, delay);
