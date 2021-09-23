const port = 5001;

const mqtt = require("mqtt");
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Use helmet middleware for setting http headers
app.use(helmet());

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const Actuator = require("./models/actuators");
const Sensor = require("./models/sensors");
const Location = require("./models/locations");
const User = require("./models/users");

// Custom middleware that attaches response headers for cross-origin requests
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Connect to mqtt broker and subscribe to /sensordata
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe("/smartBuilding/sensor/+/+"); // Topic - /smartBuilding/sensor/sensorType/sensorID , Message - {timeStamp, value}
  client.subscribe("/smartBuilding/location/+"); // Topic - /smartBuilding/location/locationId , Message - "userId"
});
client.on("error", (error) => {
  console.log(`Error Connecting to MQTT broker: ${error}`);
});

let regex = new RegExp("/smartBuilding/([a-zA-Z]*)/");

// Listen to messages from the subscribed topics
client.on("message", function (topic, message) {
  console.log(topic);
  let ar = regex.exec(topic);
  let data = ar[1];

  if (data == "sensor") {
    let senosrRegex = new RegExp(
      "/smartBuilding/([a-zA-Z]*)/([a-zA-Z0-9]*)/([a-zA-Z0-9]*)"
    );
    let arr = senosrRegex.exec(topic);
    let sensorType = arr[2];
    let sensorId = arr[3];
    console.log(sensorType, sensorId);
    recvJSON = JSON.parse(message.toString()); // message is Buffer. So, convert it to JSON format
    console.log("recvJSON=", recvJSON);
    const newSensorData = {
      timeStamp: recvJSON.timeStamp,
      value: recvJSON.value,
    };

    Sensor.findOneAndUpdate(
      { type: sensorType, _id: sensorId },
      { $push: { sensorData: newSensorData } },
      { projection: { location: 1 } },
      (err, doc) => {
        if (err) console.log(err);
        else {
          let sensorLocation = doc.location.id;
          if (sensorType === "motionSensor") {
            Location.findOneAndUpdate(
              {
                _id: sensorLocation,
                light_state: { mode: "Motion", on: false },
              },
              { light_state: { on: true } },
              (err, doc) => {
                if (doc) {
                  const newState = {
                    on: doc.light_state.on,
                    brightness: doc.light_state.brightness,
                    colour: doc.light_state.colour,
                    timeStamp: Date.now(),
                  };
                  Actuator.updateMany(
                    { _id: { $in: doc.lights }, type: "light" },
                    { $push: { state: newState } },
                    (err, doc) => {
                      if (err) {
                        console.log("ERROR");
                      } else {
                        console.log("DONE");
                      }
                    }
                  );
                }
              }
            );
          } else if (sensorType === "ambientSensor") {
            let _brightness = 100 - newSensorData.value;
            if (_brightness < 30) _brightness = 30;
            if (_brightness > 100) _brightness = 100;
            Location.findOneAndUpdate(
              {
                _id: sensorLocation,
                light_state: { mode: "Ambient" },
              },
              { light_state: { on: true, brightness: _brightness } },
              (err, doc) => {
                if (doc) {
                  const newState = {
                    on: true,
                    brightness: _brightness,
                    colour: doc.light_state.colour,
                    timeStamp: Date.now(),
                  };
                  Actuator.updateMany(
                    { _id: { $in: doc.lights }, type: "light" },
                    { $push: { state: newState } },
                    (err, doc) => {
                      if (err) {
                        console.log("ERROR");
                      } else {
                        console.log("DONE");
                      }
                    }
                  );
                }
              }
            );
          } else if (sensorType === "tempSensor") {
            let idealTemp = 20;
            let diff = idealTemp - newSensorData.value;
            let _temperature = idealTemp + diff;
            if (_temperature < 16) {
              _temperature = 16;
            } else if (_temperature > 32) {
              _temperature = 16;
            }
            Location.findOneAndUpdate(
              {
                _id: sensorLocation,
                aircon_state: { mode: "Ambient" },
              },
              { aircon_state: { on: true }, aircon_temp: _temperature },
              (err, doc) => {
                if (doc) {
                  const newState = {
                    on: true,
                    temperature: _temperature,
                    timeStamp: Date.now(),
                  };
                  Actuator.updateMany(
                    { _id: { $in: doc.aircons }, type: "aircon" },
                    { $push: { state: newState } },
                    (err, doc) => {
                      if (err) {
                        console.log("ERROR");
                      } else {
                        console.log("DONE");
                      }
                    }
                  );
                }
              }
            );
          }
        }
      }
    );
  } else if (data == "location") {
    // Topic - /smartBuilding/location/locationId -m "userId"
    // Test commands:
    // mqtt publish -h broker.hivemq.com -t /smartBuilding/location/613c8f834048e97a48addf3f -m "613c7359db8ca442ac477ce5"

    let locationRegex = new RegExp("/smartBuilding/location/([a-zA-Z0-9]*)");
    // Check in the user's document if the user has preferences activated for this room
    let arr = locationRegex.exec(topic);
    let locationId = arr[1];
    let userId = message.toString(); // message is Buffer. So, convert it to string
    User.findOneAndUpdate(
      { _id: userId },
      { location: locationId },
      {
        returnNewDocument: true,
        projection: "access preferences",
      },
      (error, result) => {
        if (!error) {
          if (result.access == "admin" && result.preferences.length) {
            let prefIndex = result.preferences.findIndex(
              (pref) => pref.locationId === locationId
            );
            // If the user has set preferences for this room
            if (prefIndex >= 0) {
              let userPreference = result.preferences[prefIndex];
              // If preferences are activated
              if (userPreference.isActive) {
                if (userPreference.light) {
                  userPreference.light.on = true;
                  userPreference.light.mode = "Preference";
                  Location.findOneAndUpdate(
                    { _id: locationId },
                    {
                      light_state: {
                        on: userPreference.light.on,
                        brightness: userPreference.light.brightness,
                        colour: userPreference.light.colour,
                        mode: userPreference.light.mode,
                        timeStamp: Date.now(),
                      },
                    },
                    { returnNewDocument: true },
                    (err, doc) => {
                      if (err) console.log(err);
                      else {
                        const newState = {
                          on: userPreference.light.on,
                          brightness: userPreference.light.brightness,
                          colour: userPreference.light.colour,
                          timeStamp: Date.now(),
                        };
                        Actuator.updateMany(
                          { _id: { $in: doc.lights }, type: "light" },
                          { $push: { state: newState } },
                          (err, doc) => {
                            if (err) {
                              console.log("ERROR");
                            } else {
                              console.log("DONE");
                            }
                          }
                        );
                      }
                    }
                  );
                }

                if (userPreference.aircon) {
                  userPreference.aircon.on = true;
                  userPreference.aircon.mode = "Preference";
                  Location.findOneAndUpdate(
                    { _id: locationId },
                    {
                      aircon_state: {
                        on: userPreference.aircon.on,
                        aircon_temp: userPreference.aircon.temperature,
                        mode: userPreference.aircon.mode,
                      },
                    },
                    { returnNewDocument: true },
                    (err, doc) => {
                      if (err) console.log(err);
                      else {
                        // console.log("DOC=", doc);
                        const newState = {
                          on: userPreference.aircon.on,
                          temperature: userPreference.aircon.temperature,
                          timeStamp: Date.now(),
                        };
                        // console.log("newState=", newState);
                        Actuator.updateMany(
                          { _id: { $in: doc.aircons }, type: "aircon" },
                          { $push: { state: newState } },
                          (err, doc) => {
                            if (err) {
                              console.log("ERROR");
                            } else {
                              console.log("DONE");
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            }
            // Else if the user has NOT set preferences for this room
            else {
              console.log(
                "No preferences set by the user for this location yet"
              );
            }
          }
        } else {
          console.log(error);
        }
      }
    );
  }
});

// POST Change state of lights in the room
app.post("/mqtt-api/light-state/:locationId", (req, res) => {
  Location.findOneAndUpdate(
    { _id: req.params.locationId },
    { light_state: req.body },
    { returnNewDocument: true },
    (err, doc) => {
      if (err) {
        res.send(err);
      } else {
        const newState = {
          on: req.body.on,
          brightness: req.body.brightness,
          colour: req.body.colour,
          timeStamp: Date.now(),
        };
        Actuator.updateMany(
          { _id: { $in: doc.lights }, type: "light" },
          { $push: { state: newState } },
          (err, doc2) => {
            if (err) {
              res.send(err);
            } else {
              // Publish to all lights in the room
              doc.lights.forEach(lightId => {
                let topic = `/smartBuilding/actuator/light/${lightId}`;
                let message = {
                  on: newState.on,
                  brightness: newState.brightness,
                  colour: newState.colour,
                };
                message = JSON.stringify(message);
                client.publish(topic, message);
              });
              res.send("DONE");
            }
          }
        );
      }
    }
  );
});

// POST Change state of air conditioners in the room
app.post("/mqtt-api/aircon-state/:locationId", (req, res) => {
  Location.findOneAndUpdate(
    { _id: req.params.locationId },
    { aircon_state: req.body },
    { returnNewDocument: true },
    (err, doc) => {
      if (err) {
        res.send(err);
      } else {
        const newState = {
          on: req.body.on,
          temperature: req.body.aircon_temp,
          timeStamp: Date.now(),
        };
        Actuator.updateMany(
          { _id: { $in: doc.aircons }, type: "aircon" },
          { $push: { state: newState } },
          (err, doc2) => {
            if (err) {
              res.send(err);
            } else {
              // Publish to all air conditioners in the room
              doc.aircons.forEach(airconId => {
                let topic = `/smartBuilding/actuator/aircon/${airconId}`;
                let message = {
                  on: newState.on,
                  temperature: newState.temperature,
                };
                message = JSON.stringify(message);
                client.publish(topic, message);
              });
              res.send("DONE");
            }
          }
        );
      }
    }
  );
});

app.listen(port, () => {
  console.log(`MQTT Server running on port ${port}`);
});
