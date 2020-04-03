const mqtt = require('mqtt')
const fs = require('fs');


if (!process.env.IOT_ENDPOINT) throw new Error('error: IOT_ENDPOINT is not defined in environment variables!');


const CLIENT_ID = 'SensorClientId';

const options = {
    key: fs.readFileSync('./certs/52c5630200-private.pem.key'),
    cert: fs.readFileSync('./certs/52c5630200-certificate.pem.crt'),
    ca: [fs.readFileSync('./certs/AmazonRootCA1.pem')],
    clientId: CLIENT_ID,
    debug: true
};

const host = `mqtt://${process.env.IOT_ENDPOINT}:8883`
let client = null;
let nrOfMessages = 0;


function onConnect() {
    console.log('connected to IoT core')
    sendSensorData()
}


function onError(err) {
    console.log('error emitted from client:', err)
}

function onEnd() {
    console.log('end emitted from client')
}

function onOffline() {
    console.log('offline emitted from client')
}

function onDisconnect(packet) {
    console.log('disconnect packet received', packet)
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function sendSensorData() {
    const topic = 'mytopic/data/building_123';

    const testPayload = {
        sensorId: 'sensor_666',
        type: 'temperature',
        value: randomIntFromInterval(0, 30),
        timestamp: (new Date()).toISOString()
    }

    client.publish(topic, JSON.stringify(testPayload))
    console.log(`published sensor data ${++nrOfMessages}`);
    console.log('Setup next interval [5s]')
    setTimeout(sendSensorData, 5*1000);
}

(async () => {
    console.log("Start simulation")

    client = mqtt.connect(host, options);

    client.on('connect', onConnect)
    client.on('error', onError)
    client.on('end', onEnd)
    client.on('offline', onOffline)
    client.on('disconnect', onDisconnect)

})().catch(e => {
    console.log("FAILED TO START", e);
    process.exit(1);
});

