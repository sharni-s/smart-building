// Program to publish random values
// for all motion sensors assigned to a room
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
  // Get all motion sensors and publish random sensor data for each
  Sensor.find(
    { type: "motionSensor", location: { $ne: null } },
    "type _id location"
  )
    .then((response) => {
      response.forEach((sensor) => {
        let timeStamp = Date.now();
        let value = Math.random();
        if (value > 0.8) {
          // Publish message only when motion is detected
          let topic = `/smartBuilding/sensor/${sensor.type}/${sensor._id}`;
          let message = JSON.stringify({ timeStamp, value: 1 });
          client.publish(topic, message, () => {
            console.log(`\nPublished to ${topic}:`);
            console.log(`${message}`);
          });
        }
      });
    })
    .catch((error) => {
      console.log(error);
    });
}
