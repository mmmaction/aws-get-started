const httputil = require("./httputil");
const path = require("path");
const fs = require("fs");
const url = require("url");

const BASE_PATH = process.env.BASE_PATH;

async function getBearerToken() {

  //console.log("GET BEARER TOKEN...");

  
  let token = process.env.ACCESS_TOKEN;
  if (token) {
    console.log("GOT token from environement");
    return token;
  }
  

  let clientId = process.env.CLIENT_ID;
  let clientSecret = process.env.CLIENT_SECRET;

  let audience = process.env.AUDIENCE;

  let body =
  {
    "client_id": clientId,
    "client_secret": clientSecret,
    "audience": audience,
    "grant_type": "client_credentials"
  };

  let path = "/oauth/token"

  let req = {
    schema: "https",
    host: process.env.AUTH0_DOMAIN,
    path: path,
    method: "POST",
    data: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json;charset=utf-8"
    }
  };

  let res = await httputil.smartRequest(req);

  //console.log("GOT BEARER TOKEN");

  return res.data.access_token;
}

async function createBuilding(token) {

  let path = `${BASE_PATH}`;
  let data = TEST_BUILDING;
  data.data.attributes.name = `E2E TEST @${new Date(Date.now()).toISOString()}`;
  let req = getPostRequest(token, path, data);
  let res = await httputil.smartRequest(req, 10000);
  return res;

}

async function createDatapoint(token, obj) {

  let bid = getBuildingId();
  let resource = "datapoints"
  let path = `${BASE_PATH}/${bid}/${resource}`;
  let req = getPostRequest(token, path, obj);
  let res = await httputil.smartRequest(req, 10000);
  return res;

}

async function updateDatapoint(token, dpId, obj) {

  let bid = getBuildingId();
  let resource = "datapoints"
  let path = `${BASE_PATH}/${bid}/${resource}/${dpId}`;
  let req = getPatchRequest(token, path, obj);
  let res = await httputil.smartRequest(req, 10000);
  return res;

}

async function deleteDatapoint(token, dpId) {

  let bid = getBuildingId();
  let resource = "datapoints"
  let path = `${BASE_PATH}/${bid}/${resource}/${dpId}`;
  let req = getDeleteRequest(token, path);
  let res = await httputil.smartRequest(req, 10000);
  return res;

}

async function createObservation(token, obj) {

  let bid = getBuildingId();
  let resource = "observations"
  let path = `${BASE_PATH}/${bid}/${resource}`;
  let req = getPostRequest(token, path, obj);
  let res = await httputil.smartRequest(req, 10000);
  return res;

}

async function getBuildings(token) {
  let req = getGetRequest(token, BASE_PATH);
  let res = await httputil.smartRequest(req, 10000);
  return res;
}
async function getBuildingById(token, bid) {
  let path = `${BASE_PATH}/${bid}`;
  let req = getGetRequest(token, path);
  let res = await httputil.smartRequest(req, 10000);
  return res;
}
async function getBuildingBySourceId(token, id) {
  let filter = `?filter[source]=${id}`;
  let path = `${BASE_PATH}?${filter}`;
  let req = getGetRequest(token, path);
  let res = await httputil.smartRequest(req, 10000);
  return res;
}

async function getFloors(token, bid) {
  return listResource(token, "floors");
}
async function getFloorByName(token, name) {
  return getByFilter(token, "floors", "name", name);
}
async function getFloorById(token, id) {
  return getByFilter(token, "floors", "source", id);
}

async function getFullPath(fileUrl) {

  /*
  let smartUrl = url.parse(fileUrl);

  let req = {
    schema: "https",
    host: smartUrl.host,
    path: smartUrl.path,
    method: "GET"
  };

  console.log("CONTENT REQ", req);
  
  let response = await httputil.smartRequest(req);
*/

  let response = await httputil.get(fileUrl);

  return response.data;
}

async function getPath(token, path) {
  //let bid = getBuildingId();
  let req = getGetRequest(token, path);
  let res = await httputil.smartRequest(req, 10000);

  return res;
}

async function getSpaces(token) {
  return listResource(token, "spaces");
}
async function getSpaceByName(token, name) {
  return getByFilter(token, "spaces", "name", name);
}
async function getSpaceById(token, id) {
  return getByFilter(token, "spaces", "source", id);
}

async function getDevices(token) {
  return listResource(token, "devices");
}
async function getDeviceByName(token, name) {
  return getByFilter(token, "devices", "name", name);
}
async function getDeviceById(token, id) {
  return getByFilter(token, "devices", "source", id);
}

async function getAllDatapoints(token) {
  let pagesize = 50;
  return listAllResources(token, "datapoints", pagesize);
}

async function getAllDatapointsByFilter(token, filterKey, filterValue) {
  let pagesize = 50;
  return listAllResourcesByFilter(token, "datapoints", pagesize, filterKey, filterValue);
}

async function getDatapoints(token) {
  return listResource(token, "datapoints");
}

async function getObservations(token) {
  return listResource(token, "observations");
}

async function getDatapointsBySourceId(token, sourceId) {
  return getByFilter(token, "datapoints", "source.id", sourceId);
}

async function getByFilter(token, resource, filterKey, filterValue) {
  let bid = getBuildingId();
  let filter = `?filter[${filterKey}]=${filterValue}`;
  let path = `${BASE_PATH}/${bid}/${resource}${filter}`;
  let req = getGetRequest(token, path);
  let res = await httputil.smartRequest(req, 10000);
  return res;
}

async function listResource(token, resource) {
  let bid = getBuildingId();
  let path = `${BASE_PATH}/${bid}/${resource}`;
  let req = getGetRequest(token, path);
  let res = await httputil.smartRequest(req, 10000);
  return res;
}

async function listAllResources(token, resource, pagesize) {
  let bid = getBuildingId();
  let paging = `?page[limit]=${pagesize}`;
  let path = `${BASE_PATH}/${bid}/${resource}${paging}`;
  let req = getGetRequest(token, path);
  let result = { "data" : [] };
  let res = null;
  while (true) {
    res = await httputil.smartRequest(req, 10000);
    if (res.status == 200) {
      result.data = result.data.concat(res.data.data);
    } else {
      console.log(`Request failed with status ${res.status}`);
      break;
    }

    path = res.data.links.next;
    if (!path) {
      break;
    }
    req.url = path;
  }
  result.status = res.status;
  return result;
}

async function listAllResourcesByFilter(token, resource, pagesize, filterKey, filterValue) {
  let bid = getBuildingId();
  let filter = `?filter[${filterKey}]=${filterValue}`;
  let paging = `?page[limit]=${pagesize}`;
  let path = `${BASE_PATH}/${bid}/${resource}${filter}${paging}`;
  let req = getGetRequest(token, path);
  let result = { "data" : [] };
  let res = null;
  while (true) {
    res = await httputil.smartRequest(req, 10000);
    if (res.status == 200) {
      result.data = result.data.concat(res.data.data);
    } else {
      console.log(`Request failed with status ${res.status}`);
      break;
    }

    path = res.data.links.next;
    if (!path) {
      break;
    }
    req.url = path;
  }
  result.status = res.status;
  return result;
}

function getGetRequest(token, path) {
  console.log("PATH", path)
  return getRequest(token, "GET", path, null);
}

function getPostRequest(token, path, data) {
  return getRequest(token, "POST", path, JSON.stringify(data));
}

function getPatchRequest(token, path, data) {
  return getRequest(token, "PATCH", path, JSON.stringify(data));
}

function getDeleteRequest(token, path, ) {
  return getRequest(token, "DELETE", path, null);
}

function getRequest(token, method, path, data) {
  return {
    schema: "https",
    host: process.env.API_DOMAIN,
    path: path,
    method: method,
    data: data,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  };
}

function getBuildingId() {
  return process.env.BID;
}

function handleException(err) {
  console.log("Exception occurred");
  if (err.response) {
    console.log(`Status=${err.response.status}`);
    console.log(err.response.data);
  } else {
    console.log(err);
  }
  process.exit(1);
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function uploadFile(bid, fileName, token) {

  console.log(`UPLOAD file for building ${bid}...`);

  let attr = await createUpload(bid, fileName, token);
  //console.log(attributes=`${JSON.stringify(attr)}`);
  let key = attr.Key;
  let uploadId = attr.UploadId;
  console.log(`Key=${key}`);
  console.log(`UploadId=${uploadId}`);
  console.log();

  let url = await getPresignedUrl(key, uploadId, token);
  console.log(`url=${url}`);
  console.log();

  let res = await putFile(url, fileName);
  console.log(`Status=${res.status}`);
  let etag = res.headers.etag;
  console.log(`etag=${etag}`);
  console.log();

  res = await completeUpload(key, uploadId, etag, token);
  console.log(`Status=${res.status}`);
  console.log();

  return key;
}

async function createUpload(bid, fileName, token) {

  console.log("CREATE UPLOAD...");

  let path = "/filemanager/create-upload";

  let bodyData = getCreateUploadData(bid, fileName);
  //console.log(JSON.stringify(bodyData));

  let req = getPostRequest(token, path, bodyData);

  try {
    let res = await httputil.smartRequest(req, 10000);

    console.log("CREATE UPLOAD done");
    return res.data.data.attributes;
  }
  catch (err) {
    handleException(err);
  }
}

function getCreateUploadData(bid, fileName) {

  return {
    building: bid,
    displayName: path.basename(fileName),
    email: UPLOAD_EMAIL,
    path: "",
    size: getFilesizeInBytes(fileName)
  };
}

function getFilesizeInBytes(filename) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

async function getPresignedUrl(key, uploadId, token) {

  console.log("GET PRESIGNED URL...");

  let path = "/filemanager/presigned-url";
  path = path + `?key=${key}&id=${uploadId}&type=uploadPart&part=1`;
  let req = getGetRequest(token, path);

  //console.log(JSON.stringify(req));

  try {
    let res = await httputil.smartRequest(req, 10000);
    console.log("GET PRESIGNED URL done");
    return res.data.data.attributes.url;
  }
  catch (err) {
    handleException(err);
  }
}


async function putFile(url, fileName) {

  console.log(`PUT FILE '${fileName}'...`);

  let readStream = fs.createReadStream(fileName);

  let req = {
    url: url,
    method: "PUT",
    data: readStream,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": getFilesizeInBytes(fileName)
    }
  };

  //console.log(JSON.stringify(req));

  try {
    let res = await httputil.smartRequest(req, 10000);

    console.log("PUT FILE done");
    return res;
  }
  catch (err) {
    handleException(err);
  }

}

async function completeUpload(key, uploadId, etag, token) {

  console.log("COMPLETE UPLOAD...");

  let path = "/filemanager/complete-upload";

  let bodyData = getCompleteUploadData(key, uploadId, etag);
  //console.log(JSON.stringify(bodyData));

  let req = getPostRequest(token, path, bodyData);

  try {
    let res = await httputil.smartRequest(req, 10000);

    console.log("COMPLETE UPLOAD done");
    //console.log(res);
    return res;
  }
  catch (err) {
    handleException(err);
  }
}

function getCompleteUploadData(key, uploadId, etag) {
  return {
    Key: key,
    MultipartUpload:
    {
      Parts:
        [{
          ETag: etag,
          PartNumber: 1
        }]
    },
    UploadId: uploadId
  };
}

async function storeBuildingId(bid) {
  let obj = { bid: bid };
  var content = JSON.stringify(obj);
  await fs.writeFile('./resources/buildings.json', content, 'utf8', function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("BID successfully saved!");
  });
}

async function createBuildingTwin(key, token) {

  console.log("CREATE BUILDING TWIN...");

  let path = `/filemanager/files/${key}/import`;
  let req = getGetRequest(token, path);

  //console.log(JSON.stringify(req));

  try {
    let res = await httputil.smartRequest(req, 10000);
    console.log("CREATE BUILDING TWIN started");
    return res;
  }
  catch (err) {
    handleException(err);
  }
}

async function waitForTwinCreation(key, token) {

  console.log("WAIT FOR TWIN CREATION...");

  let path = `/filemanager/files/${key}/info`;
  let req = getGetRequest(token, path);

  //console.log(JSON.stringify(req));

  try {

    let res = null;
    while (true) {
      res = await httputil.smartRequest(req, 10000);

      let attr = res.data.data.attributes;

      if (res.status == 200) {
        if (attr.importStatus == "processed") {
          console.log(`import status: ${attr.importStatus} -> DONE`);
          break;
        } else if (attr.importStatus == "processing") {
          console.log("CREATION in progress, wait for 20 seconds...");
          await sleep(20 * 1000);
        } else {
          console.log(`Unexpected attribute status: ${attr.importStatus}`);
          handleException(res);
        }
      } else {
        console.log(`Unexpected response status ${res.status}`);
        handleException(res);
      }
    }

    return res;
  }
  catch (err) {
    handleException(err);
  }
}

exports.createBuilding = createBuilding;
exports.getBuildings = getBuildings;
exports.getBuildingById = getBuildingById;
exports.getBuildingBySourceId = getBuildingBySourceId;
exports.getFloors = getFloors;
exports.getFloorByName = getFloorByName;
exports.getFloorById = getFloorById;
exports.getPath = getPath;
exports.getSpaces = getSpaces;
exports.getSpaceByName = getSpaceByName;
exports.getSpaceById = getSpaceById;
exports.getDevices = getDevices;
exports.getDeviceByName = getDeviceByName;
exports.getDeviceById = getDeviceById;
exports.getAllDatapoints = getAllDatapoints;
exports.getDatapoints = getDatapoints;
exports.getDatapoints = getDatapoints;
exports.getDatapointsBySourceId = getDatapointsBySourceId;
exports.deleteDatapoint = deleteDatapoint;
exports.getBearerToken = getBearerToken;
exports.handleException = handleException;
exports.sleep = sleep;
exports.getGetRequest = getGetRequest;
exports.getPostRequest = getPostRequest;
exports.getDeleteRequest = getDeleteRequest;
exports.getBuildingId = getBuildingId;
exports.uploadFile = uploadFile;
exports.storeBuildingId = storeBuildingId;
exports.createBuildingTwin = createBuildingTwin;
exports.waitForTwinCreation = waitForTwinCreation;
exports.getFullPath = getFullPath;
exports.getObservations = getObservations;
exports.createObservation = createObservation;
exports.createDatapoint = createDatapoint;
exports.updateDatapoint = updateDatapoint;
exports.getAllDatapointsByFilter = getAllDatapointsByFilter;
