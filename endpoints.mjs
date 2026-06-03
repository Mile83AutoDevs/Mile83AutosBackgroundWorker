const api_endpoint_url = [
  "https://mile83autos-api-backend-1.onrender.com/api/v1/checkServerHealth", // check main server health -> API server
  "https://mile83autos-ai-node-3nit.onrender.com/Mile83LLMModel/api/v1/isAIServerOnline", // check ai server health -> LLM Server
  "https://interior-mirella-mile83autosemailserver247-3de8f8d9.koyeb.app/check-email-server-health", // check email server -> Mail server
];

export { api_endpoint_url };
