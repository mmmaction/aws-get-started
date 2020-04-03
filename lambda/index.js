var AWS = require('aws-sdk');

var esDomain = {
  region: 'eu-west-1',
  endpoint: 'xxx.eu-west-1.es.amazonaws.com', // replace with your endpoint
  index: 'simulation',
  doctype: 'simulationType'
};
var endpoint = new AWS.Endpoint(esDomain.endpoint);

var creds = new AWS.EnvironmentCredentials('AWS');

exports.handler = async (event) => {

  console.log('Start Lambda handler');
  let res = await readFromEs();
  
  let esResponse = JSON.parse(res);
  
  let data = esResponse.hits.hits[0];
  console.log(`data = ${JSON.stringify(data)}`);
  
  const response = {
    statusCode: 200,
    body: data._source,
  };
  return response;
};

function readFromEs() {
  var req = new AWS.HttpRequest(endpoint);

  req.method = 'GET';
  req.path = `/simulation/_search`;
  req.region = 'eu-west-1';
  req.headers['presigned-expires'] = false;
  req.headers['Content-Type'] = 'application/json;charset=utf-8';
  req.headers['Host'] = endpoint.host;

  console.log(req);

  var signer = new AWS.Signers.V4(req, 'es');
  signer.addAuthorization(creds, new Date());

  var send = new AWS.NodeHttpClient();

  return new Promise((resolve, reject) => {
    send.handleRequest(req, null, function (httpResp) {
      var respBody = '';
      httpResp.on('data', function (chunk) {
        respBody += chunk;
      });
      httpResp.on('end', function (chunk) {
        console.log('Response: ' + respBody);
        resolve(respBody);
      });
    }, function (err) {
      console.log('Error: ' + err);
      reject(err);
    });
  });
}