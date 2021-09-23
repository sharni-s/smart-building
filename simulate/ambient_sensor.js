// Program to publish random brightness values
// for all ambient light sensors assigned to a room
// stored in the MongoDB database

const mqtt = require("mqtt");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// Connect to mqtt broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

client.on("connect", () => {
  console.log("Connected to MQTT broker");
});

client.on("error", (error) => {
  console.log(`MQTT Error: ${error}`);
});

// Connect to database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Sensor = require("./models/sensors");

// Publish Temperature Data every minute
setInterval(publishData, 10000);

function publishData() {
  const low = 40;
  const high = 100;
  // Get all temperature sensors and publish random sensor data for each
  Sensor.find(
    { type: "ambientSensor", location: { $ne: null } },
    "type _id location"
  )
    .then((response) => {
      response.forEach((sensor) => {
        let timeStamp = Date.now();
        let value = Math.floor(Math.random() * (high - low) + low);
        let topic = `/smartBuilding/sensor/${sensor.type}/${sensor._id}`;
        let message = JSON.stringify({ timeStamp, value });
        client.publish(topic, message, () => {
          console.log(`\nPublished to ${topic}:`);
          console.log(`${message}`);
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
}
