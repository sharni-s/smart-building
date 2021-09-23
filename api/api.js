const port = process.env.PORT || 5000;

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

// Custom middleware that attaches response headers for cross-origin requests
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Import Database Models
const User = require("./models/users");
const Location = require("./models/locations");
const Actuator = require("./models/actuators");
const Sensor = require("./models/sensors");

/**
 * @api {get} /api Test API
 * @apiGroup Test
 * @apiSuccessExample {json} Success-Response
 *    "Welcome to Smart Building API!"
 */
app.get("/api", (req, res) => {
  res.send("Welcome to Smart Building API!");
});

/**
 * @api {get} /api/preferences/:userId/:locationId Get User Preferences
 * @apiGroup Preferences
 * @apiDescription Get the user's preferences for the given location in the smart building
 * @apiParam {String} userId ID of the User
 * @apiParam {String} locationId ID of the Location
 * @apiExample {url} Example usage
 *  /api/preferences/614bb22aca22eb5280f1bacf/614b90faf6611355141fd2b3
 * @apiSuccessExample {json} Success-Response
 * {
 *   "light": {
 *      "colour": "#c2d9ff",
 *      "brightness": "39"
 *   },
 *   "aircon": {
 *      "temperature": 22
 *   },
 *   "_id": "614bb3ab15781516d835c335",
 *   "locationId": "614b90faf6611355141fd2b3",
 *   "isActive": true
 * }
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.get("/api/preferences/:userId/:locationId", (req, res) => {
  User.find(
    {
      _id: req.params.userId,
      preferences: { $elemMatch: { locationId: req.params.locationId } },
    },
    "preferences.$"
  )
    .then((response) => {
      if (response.length) {
        res.send(response[0].preferences[0]);
      } else {
        res.send({});
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

/**
 * @api {post} /api/preferences/:userId/:locationId Set User Preferences
 * @apiGroup Preferences
 * @apiDescription Set the user's preferences for the given location in the smart building
 * @apiParam {String} userId ID of the User
 * @apiParam {String} locationId ID of the Location
 * @apiExample {url} Example usage
 *  /api/preferences/614bb22aca22eb5280f1bacf/614b90faf6611355141fd2b3
 *  body =
 *  {
 *     isActive: true,
 *     brightness: '39',
 *     colour: '#c2d9ff',
 *     temperature: '22'
 *  }
 * @apiSuccessExample {String} Success-Response
 *    "DONE"
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.post("/api/preferences/:userId/:locationId", (req, res) => {
  if (!req.body.colour) {
    req.body.colour = null;
  }
  if (!req.body.brightness) {
    req.body.brightness = null;
  }
  if (!req.body.temperature) {
    req.body.temperature = null;
  }
  User.findOneAndUpdate(
    {
      _id: req.params.userId,
      preferences: { $elemMatch: { locationId: req.params.locationId } },
    },
    {
      $set: {
        "preferences.$.isActive": req.body.isActive,
        "preferences.$.light.colour": req.body.colour,
        "preferences.$.light.brightness": req.body.brightness,
        "preferences.$.aircon.temperature": req.body.temperature,
      },
    },
    (error, result) => {
      if (!error) {
        // If the document doesn't exist
        if (!result) {
          // Create it
          let newPreferences = {
            locationId: req.params.locationId,
            isActive: req.body.isActive,
            light: {
              colour: req.body.colour,
              brightness: req.body.brightness,
            },
            aircon: {
              temperature: req.body.temperature,
            },
          };
          User.updateOne(
            { _id: req.params.userId },
            { $push: { preferences: newPreferences } },
            (err, doc) => {
              if (err) {
                res.send(err);
              } else {
                res.send("DONE");
              }
            }
          );
        } else {
          res.send("DONE");
        }
      } else {
        res.send(err);
      }
    }
  );
});

/**
 * @api {get} /api/locations/:locationId? Get Details of Location(s)
 * @apiGroup Location
 * @apiDescription Get details like state of devices in a location in the smart building.
 * @apiParam {String} locationId ID of the Location
 * @apiExample {url} Example usage
 *  /api/locations/614b64747a4a906b9c7db78f
 * @apiSuccessExample {json} Success-Response with parameter
 * {
 *   light_state: {
 *     on: false,
 *     colour: "#FFFFFF",
 *     brightness: 100,
 *     mode: "Manual",
 *   },
 *   aircon_state: {
 *     on: false,
 *     aircon_temp: 24,
 *     mode: "Manual",
 *   },
 *   lights: [
 *     {
 *       id: "Test L1",
 *       name: "Test Light",
 *     },
 *   ],
 *   aircons: [
 *     {
 *       id: "Test A1",
 *       name: "Test Aircon",
 *     },
 *   ],
 *   _id: "614b64747a4a906b9c7db78f",
 *   name: "Test Room",
 *   floorNo: 3,
 *   tempSensor: {
 *     id: "Test T1",
 *     name: "Test Temp",
 *     sensorData: [],
 *   },
 *   motionSensor: {
 *     id: "Test M1",
 *     name: "Test Motion",
 *     sensorData: [],
 *   },
 *   ambientSensor: {
 *     id: "Test AS1",
 *     name: "Test Ambient Light",
 *     sensorData: [],
 *   },
 *   __v: 0,
 * }
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.get("/api/locations/:locationId?", (req, res) => {
  if (!req.params.locationId) {
    Location.find(
      {},
      "_id name floorNo lights aircons tempSensor ambientSensor motionSensor"
    )
      .then((response) => {
        res.send(response);
      })
      .catch((error) => {
        res.send(error);
      });
  } else {
    Location.find({ _id: req.params.locationId })
      .then((response) => {
        locationDetails = JSON.parse(JSON.stringify(response[0]));
        let actuators = [...locationDetails.lights, ...locationDetails.aircons];
        locationDetails.lights = [];
        locationDetails.aircons = [];
        Actuator.find({ _id: { $in: actuators } }, "_id name type")
          .then((res1) => {
            res1.forEach((act) => {
              if (act.type == "light") {
                locationDetails.lights.push({ id: act._id, name: act.name });
              } else if (act.type == "aircon") {
                locationDetails.aircons.push({ id: act._id, name: act.name });
              }
            });
            let sensors = [
              locationDetails.tempSensor,
              locationDetails.motionSensor,
              locationDetails.ambientSensor,
            ];
            locationDetails.tempSensor = {};
            locationDetails.motionSensor = {};
            locationDetails.ambientSensor = {};
            Sensor.find({ _id: { $in: sensors } }, "_id name type sensorData")
              .then((res2) => {
                res2.forEach((sen) => {
                  if (sen.type == "tempSensor") {
                    locationDetails.tempSensor = {
                      id: sen._id,
                      name: sen.name,
                      sensorData: sen.sensorData,
                    };
                  } else if (sen.type == "motionSensor") {
                    locationDetails.motionSensor = {
                      id: sen._id,
                      name: sen.name,
                      sensorData: sen.sensorData,
                    };
                  } else if (sen.type == "ambientSensor") {
                    locationDetails.ambientSensor = {
                      id: sen._id,
                      name: sen.name,
                      sensorData: sen.sensorData,
                    };
                  }
                });
                res.send(locationDetails);
              })
              .catch((error) => {
                res.send(error);
              });
          })
          .catch((error) => {
            res.send(error);
          });
      })
      .catch((error) => {
        res.send(error);
      });
  }
});

/**
 * @api {post} /api/add-location Add New Location
 * @apiGroup Location
 * @apiDescription If location already exists, "Room already exists" is sent as response.
 * @apiExample {url} Request Body:
 *  body =
 *  {
 *     roomName: "Test Room",
 *     floorNo: "3",
 *     lights: "Test L1",
 *     aircons: "Test A1",
 *     tempSensors: "Test T1",
 *     ambientSensors: "Test AS1",
 *     motionSensors: "Test M1",
 *  }
 * @apiSuccessExample {String} Success-Response
 *    "New Location Added"
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.post("/api/add-location", (req, res) => {
  Location.exists({ name: req.body.roomName, floorNo: req.body.floorNo })
    .then((response) => {
      if (response == true) {
        res.send("Room already exists");
      } else {
        const newLocation = new Location({
          name: req.body.roomName,
          floorNo: req.body.floorNo,
          lights: req.body.lights,
          aircons: req.body.aircons,
          tempSensor: req.body.tempSensors,
          motionSensor: req.body.motionSensors,
          ambientSensor: req.body.ambientSensors,
        });
        if (req.body.lights) {
          newLocation.light_state = {
            on: false,
            colour: "#FFFFFF",
            brightness: 100,
            mode: "Manual",
          };
        }
        if (req.body.aircons) {
          newLocation.aircon_state = {
            on: false,
            aircon_temp: 24,
            mode: "Manual",
          };
        }
        newLocation
          .save()
          .then((doc) => {
            let thisLocation = doc.name + " Floor " + doc.floorNo;
            const deviceLocation = {
              id: doc._id,
              name: thisLocation,
            };
            let actuators = [...doc.lights, ...doc.aircons];
            Actuator.updateMany(
              { _id: { $in: actuators } },
              { location: deviceLocation, state: [] },
              (err1, doc1) => {
                if (err1) {
                  res.send(err1);
                } else {
                  let sensors = [
                    doc.tempSensor,
                    doc.ambientSensor,
                    doc.motionSensor,
                  ];
                  Sensor.updateMany(
                    { _id: { $in: sensors } },
                    { location: deviceLocation, sensorData: [] },
                    (err2, doc2) => {
                      if (err2) {
                        res.send(err2);
                      } else {
                        res.send("New Location Added");
                      }
                    }
                  );
                }
              }
            );
          })
          .catch((error) => {
            res.send(error);
          });
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

/**
 * @api {post} /api/edit-location/:locationId Update Devices in Location
 * @apiGroup Location
 * @apiDescription Add or delete devices in a location in the smart building.
 * @apiParam {String} locationId ID of the Location
 * @apiExample {url} Example usage
 *  /api/edit-location/614b64747a4a906b9c7db78f
 *  body =
 *  {
 *     lights: "Test L1",
 *     aircons: "Test A1",
 *     tempSensors: "Test T1",
 *     ambientSensors: "Test AS1",
 *     motionSensors: "Test M1",
 *  }
 * @apiBody {String} [lights] Lights in the room
 * @apiBody {String} [aircons] Air conditioners in the room
 * @apiBody {String} [tempSensors] Temperature Sensors in the room
 * @apiBody {String} [ambientSensors] Ambient Sensors in the room
 * @apiBody {String} [motionSensors] Motion Sensors in the room
 * @apiSuccessExample {json} Success-Response
 *    "DONE"
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.post("/api/edit-location/:locationId", (req, res) => {
  if (req.body) {
    let new_aircon_state = null,
      new_light_state = null;
    if (!req.body.lights) {
      req.body.lights = [];
    } else {
      new_light_state = {
        on: false,
        colour: "#FFFFFF",
        brightness: 100,
        mode: "Manual",
      };
    }
    if (!req.body.aircons) {
      req.body.aircons = [];
    } else {
      new_aircon_state = {
        on: false,
        aircon_temp: 24,
        mode: "Manual",
      };
    }
    Location.findOneAndUpdate(
      { _id: req.params.locationId },
      {
        lights: req.body.lights,
        aircons: req.body.aircons,
        tempSensor: req.body.tempSensors,
        motionSensor: req.body.motionSensors,
        ambientSensor: req.body.ambientSensors,
        light_state: new_light_state,
        aircon_state: new_aircon_state,
      },
      (err, doc) => {
        if (err) {
          res.send(err);
        } else {
          let actuators = [...doc.lights, ...doc.aircons];
          Actuator.updateMany(
            { _id: { $in: actuators } },
            { location: null },
            (err1, doc1) => {
              if (err1) {
                res.send(error);
              } else {
                let sensors = [
                  doc.tempSensor,
                  doc.motionSensor,
                  doc.ambientSensor,
                ];
                Sensor.updateMany(
                  { _id: { $in: sensors } },
                  { location: null },
                  (err2, doc2) => {
                    if (err2) {
                      res.send(err2);
                    } else {
                      let thisLocation = doc.name + " Floor " + doc.floorNo;
                      const deviceLocation = {
                        id: doc._id,
                        name: thisLocation,
                      };
                      if (typeof req.body.lights == "string") {
                        req.body.lights = [req.body.lights];
                      }
                      if (typeof req.body.aircons == "string") {
                        req.body.aircons = [req.body.aircons];
                      }
                      let new_actuators = [
                        ...req.body.lights,
                        ...req.body.aircons,
                      ];
                      Actuator.updateMany(
                        { _id: { $in: new_actuators } },
                        { location: deviceLocation },
                        (err3, doc3) => {
                          if (err3) {
                            res.send(err3);
                          } else {
                            let new_sensors = [
                              req.body.tempSensors,
                              req.body.motionSensors,
                              req.body.ambientSensors,
                            ];
                            Sensor.updateMany(
                              { _id: { $in: new_sensors } },
                              { location: deviceLocation },
                              (err4, doc4) => {
                                if (err4) {
                                  res.send(err4);
                                } else {
                                  res.send("DONE");
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } else {
    let err = {};
    err.message = "Not found";
    err.status = 404;
    next(err);
  }
});

/**
 * @api {delete} /api/locations/:locationId Delete Location
 * @apiGroup Location
 * @apiDescription Delete a location from the smart building.
 * @apiParam {String} locationId ID of the Location
 * @apiExample {url} Example usage
 *  /api/locations/614b64747a4a906b9c7db78f
 * @apiSuccessExample {String} Success-Response
 *    "DONE"
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.delete("/api/locations/:locationId", (req, res) => {
  Location.findOneAndDelete({ _id: req.params.locationId }, (err, doc) => {
    if (err) {
      res.send(err);
    } else {
      let actuators = [...doc.lights, ...doc.aircons];
      updateActuators = Actuator.updateMany(
        { _id: { $in: actuators } },
        { location: null }
      );
      Promise.allSettled([updateActuators])
        .then((result1) => {
          let sensors = [doc.tempSensor, doc.motionSensor, doc.ambientSensor];
          updateSensors = Sensor.updateMany(
            { _id: { $in: sensors } },
            { location: null }
          );
          Promise.allSettled([updateSensors])
            .then((result2) => {
              res.send("DONE");
            })
            .catch((error) => {
              res.send(error);
            });
        })
        .catch((error) => {
          res.send(error);
        });
    }
  });
});

/**
 * @api {get} /api/locations/preferences/:locationId Preference Insights
 * @apiGroup Preferences
 * @apiDescription Get the number of users with active, inactive and unset preferences in a location.
 * @apiParam {String} locationId ID of the Location
 * @apiExample {url} Example usage
 *  /api/locations/preferences/614b64747a4a906b9c7db78f
 * @apiSuccessExample {json} Success-Response
 * {
 *    "unset": 3,
 *    "active": 1,
 *    "inactive": 2
 * }
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.get("/api/locations/preferences/:locationId", (req, res) => {
  User.countDocuments({ access: "admin" }, (err, res1) => {
    if (err) {
      res.send(err);
    } else {
      let total = res1;
      User.countDocuments(
        {
          access: "admin",
          preferences: { $elemMatch: { locationId: req.params.locationId } },
        },
        (err, res2) => {
          if (err) {
            res.send(err);
          } else {
            let set = res2;
            let unset = total - set;
            User.countDocuments(
              {
                access: "admin",
                preferences: {
                  $elemMatch: {
                    locationId: req.params.locationId,
                    isActive: true,
                  },
                },
              },
              (err, res3) => {
                if (err) {
                  res.send(err);
                } else {
                  let active = res3;
                  let inactive = set - active;
                  let stats = {
                    unset,
                    active,
                    inactive,
                  };
                  res.send(stats);
                }
              }
            );
          }
        }
      );
    }
  });
});

/**
 * @api {get} /api/freeDevices Get Free Devices
 * @apiGroup Devices
 * @apiDescription Get the id, name and type of all the free devices (not assigned to any room) in the smart building.
 * @apiSuccessExample {json} Success-Response
 * {
 *   freeLights: [
 *     {
 *       _id: "Test L1",
 *       name: "Test Light",
 *       type: "light",
 *     },
 *   ],
 *   freeAircons: [
 *     {
 *       _id: "Test A1",
 *       name: "Test Aircon",
 *       type: "aircon",
 *     },
 *   ],
 *   freeTempSensors: [],
 *   freeMotionSensors: [],
 *   freeAmbientSensors: [],
 * }
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.get("/api/freeDevices", (req, res) => {
  Actuator.find({ location: null }, "_id name type")
    .then((response) => {
      let freeLights = [];
      let freeAircons = [];
      response.forEach((actuator) => {
        if (actuator.type == "light") {
          freeLights.push(actuator);
        } else if (actuator.type == "aircon") {
          freeAircons.push(actuator);
        }
      });
      Sensor.find({ location: null }, "_id name type")
        .then((response) => {
          let freeTempSensors = [];
          let freeMotionSensors = [];
          let freeAmbientSensors = [];
          response.forEach((sensor) => {
            if (sensor.type == "tempSensor") {
              freeTempSensors.push(sensor);
            } else if (sensor.type == "ambientSensor") {
              freeAmbientSensors.push(sensor);
            } else if (sensor.type == "motionSensor") {
              freeMotionSensors.push(sensor);
            }
          });
          const freeDevices = {
            freeLights,
            freeAircons,
            freeTempSensors,
            freeMotionSensors,
            freeAmbientSensors,
          };
          res.send(freeDevices);
        })
        .catch((error) => {
          res.send(error);
        });
    })
    .catch((error) => {
      res.send(error);
    });
});

/**
 * @api {get} /api/actuators/:deviceType Get Actuators
 * @apiGroup Devices
 * @apiParam {String="light", "aircon"} deviceType Type of actuator
 * @apiExample {url} Example usage
 *  /api/actuators/light
 * @apiDescription Get the details of all the actuators of a given type (light or aircon) in the smart building.
 * @apiSuccessExample {json} Success-Response
 * [
 *   {
 *      state: [],
 *      _id: "Test L1",
 *      name: "Test Light",
 *      manufacturer: "Philips",
 *      product_name: "Philips Hue",
 *      location: {
 *        id: "614b90faf6611355141fd2b3",
 *        name: "Test Room Floor 3",
 *      },
 *      type: "light",
 *      __v: 0,
 *   },
 *   ...
 *   ...
 *   ...
 * ]
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.get("/api/actuators/:deviceType", (req, res) => {
  Actuator.find({ type: req.params.deviceType })
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send(error);
    });
});

/**
 * @api {post} /api/actuators/:deviceType Add New Actuator
 * @apiGroup Devices
 * @apiParam {String="light", "aircon"} deviceType Type of actuator
 * @apiDescription If device id already exists, "Device ID must be unique." is sent as response.
 * @apiExample {url} Request Body:
 *  body =
 *  {
 *     deviceType: "light",
 *     deviceId: "Test L2",
 *     deviceName: "Test Light 2",
 *     deviceMan: "Philips",
 *     product: "Philips Hue",
 *  }
 * @apiSuccessExample {String} Success-Response
 *    "New Device Added"
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.post("/api/actuators/:deviceType", (req, res) => {
  Actuator.exists({ _id: req.body.deviceId })
    .then((response) => {
      if (response == true) {
        res.send("Device ID must be unique.");
      } else {
        const newActuator = new Actuator({
          _id: req.body.deviceId,
          name: req.body.deviceName,
          manufacturer: req.body.deviceMan,
          product_name: req.body.product,
          location: null,
          type: req.params.deviceType,
        });
        newActuator
          .save()
          .then((doc) => {
            res.send("New Device Added");
          })
          .catch((error) => {
            res.send(error);
          });
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

/**
 * @api {post} /api/delete/actuators/:deviceType Delete Actuators
 * @apiGroup Devices
 * @apiParam {String="light", "aircon"} deviceType Type of actuators
 * @apiDescription Delete all actuators whose IDs are sent in the request body
 * @apiExample {url} Example usage
 *  /api/delete/actuators/light
 *  body =
 *  {
 *     deviceIds: ["Test L2"],
 *  }
 * @apiSuccessExample {String} Success-Response
 *    "DELETION DONE"
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.post("/api/delete/actuators/:deviceType", (req, res) => {
  Actuator.deleteMany({
    type: req.params.deviceType,
    _id: { $in: req.body.deviceIds },
  })
    .then((response) => {
      res.send("DELETION DONE");
    })
    .catch((error) => {
      res.send(error);
    });
});

/**
 * @api {get} /api/sensors/:sensorType Get Sensors
 * @apiGroup Devices
 * @apiParam {String="tempSensor","ambientSensor","motionSensor"} sensorType Type of actuator
 * @apiExample {url} Example usage
 *  /api/sensors/tempSensor
 * @apiDescription Get the details of all the sensors of a given type (temperature sensor, ambient light sensor, motion sensor) in the smart building.
 * @apiSuccessExample {json} Success-Response
 * [
 *   {
 *      sensorData: [],
 *      _id: "Test T1",
 *      name: "Test Temp",
 *      manufacturer: "Adafruit",
 *      product_name: "LM35",
 *      location: {
 *        id: "614b90faf6611355141fd2b3",
 *        name: "Test Room Floor 3",
 *      },
 *      type: "tempSensor",
 *      __v: 0,
 *   },
 *   ...
 *   ...
 *   ...
 * ]
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.get("/api/sensors/:sensorType", (req, res) => {
  Sensor.find({ type: req.params.sensorType })
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send(error);
    });
});

/**
 * @api {post} /api/sensors/:sensorType Add New Sensor
 * @apiGroup Devices
 * @apiParam {String="tempSensor","ambientSensor","motionSensor"} sensorType Type of sensor
 * @apiDescription If device id already exists, "Device ID must be unique." is sent as response.
 * @apiExample {url} Request Body:
 *  body =
 *  {
 *     deviceType: "tempSensor",
 *     deviceId: "Test T2",
 *     deviceName: "Test Temp 2",
 *     deviceMan: "Adafruit",
 *     product: "LM35",
 *  }
 * @apiSuccessExample {String} Success-Response
 *    "New Device Added"
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.post("/api/sensors/:sensorType", (req, res) => {
  Sensor.exists({ _id: req.body.deviceId })
    .then((response) => {
      if (response == true) {
        res.send("Device ID must be unique.");
      } else {
        const newSensor = new Sensor({
          _id: req.body.deviceId,
          name: req.body.deviceName,
          manufacturer: req.body.deviceMan,
          product_name: req.body.product,
          location: null,
          type: req.params.sensorType,
        });
        newSensor
          .save()
          .then((doc) => {
            res.send("New Device Added");
          })
          .catch((error) => {
            res.send(error);
          });
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

/**
 * @api {post} /api/delete/sensors/:sensorType Delete Sensors
 * @apiGroup Devices
 * @apiParam {String="tempSensor","ambientSensor","motionSensor"} sensorType Type of sensor
 * @apiDescription Delete all sensors whose IDs are sent in the request body
 * @apiExample {url} Example usage
 *  /api/delete/sensors/tempSensor
 *  body =
 *  {
 *     deviceIds: ["Test T2"],
 *  }
 * @apiSuccessExample {String} Success-Response
 *    "DELETION DONE"
 * @apiErrorExample {json} Error-Response
 *    Error Object
 */
app.post("/api/delete/sensors/:sensorType", (req, res) => {
  Sensor.deleteMany({
    type: req.params.sensorType,
    _id: { $in: req.body.deviceIds },
  })
    .then((response) => {
      res.send("DELETION DONE");
    })
    .catch((error) => {
      res.send(error);
    });
});

app.listen(port, () => {
  console.log(`API Server running on port ${port}`);
});

/**********************************************************************************************/

// FOR FUTURE ADDITION: Endpoint to get the sensor data of a sensor
// app.get("/api/sensorData/:sensorType/:sensorId", (req, res) => {
//   Sensor.find(
//     { type: req.params.sensorType, _id: req.params.sensorId },
//     "sensorData"
//   )
//     .then((response) => {
//       console.log(response);
//       // Insert code to return sensorData here
//       res.send(response);
//     })
//     .catch((error) => {
//       console.log(error);
//       res.send(error);
//     });
// });

// FOR FUTURE ADDITION: Endpoint to get the state data of an actuator
// app.get("/api/actuatorData/:actuatorType/:actuatorId", (req, res) => {
//   Sensor.find(
//     { type: req.params.sensorType, _id: req.params.sensorId },
//     "state"
//   )
//     .then((response) => {
//       console.log(response);
//       res.send(response);
//     })
//     .catch((error) => {
//       console.log(error);
//       res.send(error);
//     });
// });
