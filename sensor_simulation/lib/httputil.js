let http = require("http");
let https = require("https");
let ProxyAgent = require('proxy-agent')

let axiosbase = require("axios");
let axios = null;

function initAxios() {

  axios = axiosbase.create({
    timeout: 20000,
   // httpAgent: new http.Agent({ keepAlive: true }),
   // httpsAgent: new https.Agent({ keepAlive: true }),
    maxRedirects: 10,
    maxContentLength: 50 * 1000 * 1000
  });


  axios.defaults.proxy = false;
}

async function get(url){

  let axiosRequest = {
    url: url,
    method: "get"
  }

  if(process.env.NODE_ENV == "development"){
    //console.log("DEV MODE DETECTED");
    const httpsProxyAgent = new ProxyAgent(process.env.HTTPS_PROXY);  
    const httpProxyAgent = new ProxyAgent(process.env.HTTP_PROXY);  
    axiosRequest.httpsAgent = httpsProxyAgent;
    axiosRequest.httpAgent = httpProxyAgent;
  }

  return await axios(axiosRequest);
}

async function smartRequest(req) {

  let headers = req.headers;

  if(!headers){
    headers = {}
  }

  let axiosRequest = {
    url: (typeof req.url !== 'undefined' && req.url) ? req.url : (req.schema + "://" + req.host + req.path),
    method: req.method,
    headers: headers,
    data: req.data
  }

  if(process.env.NODE_ENV == "development"){
    //console.log("DEV MODE DETECTED");
    const httpsProxyAgent = new ProxyAgent(process.env.HTTPS_PROXY);  
    const httpProxyAgent = new ProxyAgent(process.env.HTTP_PROXY);  
    axiosRequest.httpsAgent = httpsProxyAgent;
    axiosRequest.httpAgent = httpProxyAgent;
  }

  return await axios(axiosRequest);

}

//INIT
initAxios();

module.exports = {
  smartRequest: smartRequest,
  get: get
};
