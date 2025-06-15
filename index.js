
const axiosModule = require("axios");
const delay=5000

const _startBackgroundWorker = async ()=>{
       const api_url="https://mile83autos-api-backend.onrender.com/api/v1/checkServerHealth";
       try{
        const response = await axiosModule.get(api_url);
        console.log(`Server responded :: ${new Date().toISOString()} `)
        console.log(`Metric::`,response.data)
       }
       catch(e){
        console.log("Something went wrong, could no tstart cron job")
       }
}



setInterval(_startBackgroundWorker,delay);
 