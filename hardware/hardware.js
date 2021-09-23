const MQTT_URL = "http://localhost:5001/mqtt";

const SerialPort = require("serialport");
const axios = require("axios");
const mqtt = require("mqtt");

// Connect to mqtt broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

client.on("connect", () => {
  console.log("Connected to MQTT broker");
});

client.on("error", (error) => {
  console.log(`MQTT Error: ${error}`);
});

// Connect to serial port to receive temperature data
let myPort = new SerialPort("COM3", 9600);
let Readline = SerialPort.parsers.Readline; // make instance of Readline parser
let parser = new Readline(); // make a new parser to read ASCII lines
myPort.pipe(parser); // pipe the serial stream to the parser

// When new data is available on serial port, post it to mqtt-api
parser.on("data", (rawData) => {
  const sensorId = String(rawData.slice(1, -1).split(",")[0]);
  const value = Number(rawData.slice(1, -1).split(",")[1]);
  const type = String(rawData.slice(1, -1).split(",")[2]);
  const timeStamp = Date.now();
  
  let topic = `/smartBuilding/sensor/${type}/${sensorId}`;
  let message = JSON.stringify({ timeStamp, value });

  client.publish(topic, message, () => {
    console.log(`\nPublished to ${topic}:`);
    console.log(`${message}`);
  });
});
