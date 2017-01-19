var http = require("https");
var fs = require('file-system');
var dateFormat = require('dateformat');
var now = new Date();
var csv = require('csv');
var api_cred = require('./api-credentials.json');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


/*******************************************************/
//Write a String to File
/*******************************************************/
function write_to_file(output, filepath){
	return new Promise(function (resolve, reject){		
		console.log("++Generating "+filepath);
		
		fs.writeFile(filepath, output, function(err) {
		    if(err) {return console.log(err);}
			console.log("+++Successful Generation of "+filepath+"!");
			resolve();
		})
	});//end promise function
}//end write_to_file()



console.log ("Hostname: " + api_cred.hostname);
console.log ("Authorization: " + api_cred.authorization);
console.log ("API Client ID: " + api_cred.x_ah_api_client_id);
console.log ("API Client Secret: " + api_cred.x_ah_api_client_secret);


var default_options =
{
  "method": "GET",
  "hostname": api_cred.hostname,
  "port": null,
  "headers": {
    "authorization": api_cred.authorization,
    "x-ah-api-client-id": api_cred.x_ah_api_client_id,
    "x-ah-api-client-secret": api_cred.x_ah_api_client_secret,
    "x-ah-api-client-redirect-uri": "",
    "cache-control": "no-cache"
  }
}


var ownerId = api_cred.ownerID;
var monitor_devices_options = default_options;
monitor_devices_options.path =  '/xapi/v1/monitor/devices?ownerId='+ ownerId;

//var monitor_clients_options = default_options;
//monitor_clients_options.path =  '/xapi/v1/monitor/clients?ownerId='+ ownerId;

console.log(monitor_devices_options.path)

/*
	[{"deviceId":5141075861609,"ownerId":1197,"macAddress":"E01C411F4740","connected":true,"hostName":"FH-Bsmnt-AP","serialId":"33013050800617","model":"AP_330","ip":"192.168.1.2","mode":"PORTAL","osVersion":"6.5.4.0","lastUpdated":"2016-08-30T06:12:31.965Z","mgmtStatus":"MANAGED","subnetMask":"255.255.255.0","defaultGateway":"192.168.1.1","dns":"192.168.1.1","simType":"REAL","unAssociatedClientsCount":0,"presenceOn":true,"activeClients":0,"locations":["Home","Ashton, MD","17832 Hidden Garden Lane","Basement"]*/

var req = http.request(monitor_devices_options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    var json = JSON.parse(body.toString());
    var devices = json.data;
    var deviceCount = Object.keys(devices).length
    var realDeviceCount = 0;
    var output = '';
    
    console.log('*****Start of Output******\n');
	console.log(JSON.stringify(json.data[0]));
	
	output += '#Hostname,Model,HiveOS,Serial,MAC,IP\n';
	devices.forEach(function(device){
		
		if(device.simType == "REAL"){
			output += device.hostName + ',' + device.model + ',' +  device.osVersion + ',\'' + device.serialId + ',\'' + device.macAddress +','+ device.ip+'\n';
			//console.log(output);
			realDeviceCount++;
		}
	});

	console.log('#Total # of Devices: ' + deviceCount);
	console.log('#Total # of Real Devices: ' + realDeviceCount);

	//console.log(output);
	write_to_file(output,dateFormat(now, "yyyy-mm-dd")+'_inventory.csv');

	console.log('*****End of Output*****\n');
	
  });
});

req.end();




/*
var req = http.request(monitor_clients_options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    var json = JSON.parse(body.toString());
    var clients = json.data;
    var clientCount = Object.keys(clients).length
    var connectedClientCount = 0;
    
    console.log('Start of Output\n');
	//console.log(JSON.stringify(json.data));
	
	console.log('\n#UserName,OS,SSID');
	clients.forEach(function(client){
		
		if(client.connectionStatus == "CONNECTED"){
			console.log(client.userName + ',' + client.os + ',' +  client.ssid);
			connectedClientCount++;
		}
	});
	
	console.log('#Total # of Clients: ' + clientCount);
	console.log('#Total # of Connected Clients: ' + connectedClientCount);
	console.log('#End of Output\n');
	
  });
});


req.end();

*/

