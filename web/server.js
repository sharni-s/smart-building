const port = 3000;
const API_URL = "http://localhost:5000/api";
const MQTT_API = "http://localhost:5001/mqtt-api";

const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const ejs = require("ejs");
const axios = require("axios");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const passport = require("passport");
const passportCustom = require("passport-custom");
const CustomStrategy = passportCustom.Strategy;
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Connect to database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get User model
const User = require("./models/users");

passport.use(
  new CustomStrategy(function (req, done) {
    User.findOne(
      {
        username: req.body.username,
      },
      function (err, user) {
        done(err, user);
      }
    );
  })
);

// Passport Config
passport.use(
  "login-strategy",
  new CustomStrategy((req, done) => {
    const email = req.body.email;
    const password = req.body.password;
    // Match user
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        return done(null, false, { message: "Email is not registered" });
      }
      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Password incorrect" });
        }
      });
    });
  })
);

// Salt rounds for salting and hashing password
const saltRounds = 10;

// Use helmet middleware to set http headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       useDefaults: true,
//       directives: {
//         "script-src": [
//           "unsafe-hashes",
//           "'self'",
//           "cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js",
//           "code.jquery.com/jquery-3.6.0.min.js",
//           "https://cdn.jsdelivr.net/gh/bbbootstrap/libraries@main/choices.min.js",
//           "*"
//         ],
//         "connect-src": ["'self'", "*"],
//         "img-src": ["*", "unsafe-inline", "unsafe-eval", "data:"],
//       },
//     },
//   })
// );

// For rendering ejs files
app.set("view engine", "ejs");

// For loading static files
const base = `${__dirname}/public`;
app.use(express.static("public"));

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Express sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

// Set server to use passport sessions
app.use(passport.initialize());
app.use(passport.session());

// For serializing (packing) and deserializing (unpacking) cookies
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    uservar = { id: user.id, name: user.name, access: user.access };
    done(err, uservar);
  });
});

const actuators = ["light", "aircon"];
const sensors = ["tempSensor", "ambientSensor", "motionSensor"];

/********************************* Routes *********************************/

// GET Welcome page
app.get("/", function (req, res) {
  res.render("welcome");
});

// GET Register page
app.get("/register", (req, res) => {
  let err_name = "";
  let err_email = "";
  let error_display = "none";
  res.render("register", {
    error_display: error_display,
    err_email: err_email,
    err_name: err_name,
  });
});

// GET Login page
app.get("/login", (req, res) => {
  let error_display = "none";
  let reg_display = "none";
  res.render("login", {
    error_display: error_display,
    reg_display: reg_display,
  });
});

// POST Register users
app.post("/register", (req, res) => {
  User.exists({ email: req.body.email })
    .then((response) => {
      if (response == true) {
        // Email already registered.
        console.log("Email already registered");
        // Reload register page showing the "Email already registered" message
        let err_name = req.body.name;
        let err_email = req.body.email;
        let error_display = "inline-block";
        res.render("register", {
          error_display: error_display,
          err_email: err_email,
          err_name: err_name,
        });
      } else {
        bcrypt.hash(req.body.password, saltRounds, function (error, hash) {
          if (error) console.log(error);
          else {
            // Store hash in the password DB.
            const newUser = new User({
              name: req.body.name,
              email: req.body.email,
              password: hash,
              access: req.body.access,
              location: "",
            });
            newUser
              .save()
              .then((doc) => {
                // Go to login page, display that registration was successful and ask user to login
                let error_display = "none";
                let reg_display = "inline-block";
                res.render("login", {
                  error_display: error_display,
                  reg_display: reg_display,
                });
              })
              .catch((error) => {
                let err_name = "";
                let err_email = "";
                let error_display = "none";
                res.render("register", {
                  error_display: error_display,
                  err_email: err_email,
                  err_name: err_name,
                });
              });
          }
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

// POST Login users
app.post("/login", (req, res, next) => {
  passport.authenticate("login-strategy", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (user == false) {
      let error_display = "inline-block";
      let reg_display = "none";
      return res.render("login", {
        error_display: error_display,
        reg_display: reg_display,
      });
    }
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/home");
    });
  })(req, res, next);
});

// GET Logout users
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

// GET Homepage after user logs in
app.get("/home", (req, res) => {
  if (req.isAuthenticated()) {
    let requestURL = `${API_URL}/locations/`;
    axios.get(requestURL).then((response) => {
      let rooms = response.data;
      res.render("home", {
        access: req.user.access,
        name: req.user.name,
        rooms: rooms,
      });
    });
  } else {
    res.redirect("/");
  }
});

// GET Room page for altering room state
app.get("/room/:roomId", (req, res) => {
  if (req.isAuthenticated()) {
    let requestURL = `${API_URL}/locations/${req.params.roomId}`;
    axios
      .get(requestURL)
      .then((response) => {
        let roomInfo = response.data;
        let prefRequestURL = `${API_URL}/preferences/${req.user.id}/${req.params.roomId}`;
        axios
          .get(prefRequestURL)
          .then((result) => {
            let userPreference = {};
            if (result.data.light) {
              userPreference.light = result.data.light;
            }
            if (result.data.aircon) {
              userPreference.aircon = result.data.aircon;
            }
            if (userPreference) {
              userPreference.isActive = result.data.isActive;
            }
            let locPrefURL = `${API_URL}/locations/preferences/${req.params.roomId}`;
            axios
              .get(locPrefURL)
              .then((resp) => {
                res.render("room", {
                  name: req.user.name,
                  access: req.user.access,
                  roomInfo: roomInfo,
                  userPreference: userPreference,
                  prefStats: resp.data,
                });
              })
              .catch((error) => {
                res.render("room", {
                  name: req.user.name,
                  access: req.user.access,
                  roomInfo: roomInfo,
                  userPreference: {},
                });
              });
          })
          .catch((error) => {
            res.render("room", {
              name: req.user.name,
              access: req.user.access,
              roomInfo: roomInfo,
              userPreference: {},
            });
          });
      })
      .catch((error) => {
        res.redirect("/home");
      });
  } else {
    res.redirect("/");
  }
});

// GET Add room page for Admin users to add new rooms to the smart building
app.get("/add-room", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.access == "admin") {
      let requestURL = `${API_URL}/freeDevices`;
      axios
        .get(requestURL)
        .then((response) => {
          if (response.data != "ERROR") {
            let freeDevices = response.data;
            let error_display = "inline-block";
            let error_message = "";
            res.render("add-room", {
              name: req.user.name,
              error_display: error_display,
              error_message: error_message,
              freeDevices: freeDevices,
            });
          } else {
            let error_display = "inline-block";
            let error_message = "An error occured while loading devices.";
            res.render("add-room", {
              name: req.user.name,
              error_display: error_display,
              error_message: error_message,
              freeDevices: {},
            });
          }
        })
        .catch((error) => {
          res.redirect("/home");
        });
    } else {
      res.redirect("/home");
    }
  } else {
    res.redirect("/");
  }
});

// POST Add new rooms to the smart building
app.post("/add-room", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.access == "admin") {
      axios
        .post(`${API_URL}/add-location`, req.body)
        .then((response) => {
          if (response.data == "New Location Added") {
            res.redirect("/home");
          } else if (response.data == "Room already exists") {
            let freeDevURL = `${API_URL}/freeDevices`;
            axios
              .get(freeDevURL)
              .then((resp) => {
                let freeDevices = resp.data;
                let error_display = "inline-block";
                let error_message = `${req.body.roomName} already saved in Floor ${req.body.floorNo}.`;
                res.render("add-room", {
                  name: req.user.name,
                  error_display: error_display,
                  error_message: error_message,
                  freeDevices: freeDevices,
                });
              })
              .catch((err) => {
                res.redirect("/add-room");
              });
          }
        })
        .catch((error) => {
          res.redirect("/home");
        });
    } else {
      res.redirect("/home");
    }
  } else {
    res.redirect("/");
  }
});

// GET Edit room page for editing devices in the room
app.get("/edit-room/:roomId", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.access == "admin") {
      let requestURL = `${API_URL}/locations/${req.params.roomId}`;
      axios
        .get(requestURL)
        .then((response) => {
          roomInfo = response.data;
          let freeDevicesURL = `${API_URL}/freeDevices`;
          axios
            .get(freeDevicesURL)
            .then((resp) => {
              let freeDevices = resp.data;
              res.render("edit-room", {
                access: req.user.access,
                name: req.user.name,
                roomInfo: roomInfo,
                freeDevices: freeDevices,
              });
            })
            .catch((error) => {
              res.redirect(`/room/${req.params.roomId}`);
            });
        })
        .catch((error) => {
          res.redirect(`/room/${req.params.roomId}`);
        });
    } else {
      res.redirect(`/room/${req.params.roomId}`);
    }
  } else {
    res.redirect("/");
  }
});

// POST Modify devices in the room
app.post("/edit-room/:roomId", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.access == "admin") {
      let requestURL = `${API_URL}/edit-location/${req.params.roomId}`;
      axios
        .post(requestURL, req.body)
        .then((response) => {
          res.redirect(`/edit-room/${req.params.roomId}`);
        })
        .catch((error) => {
          res.redirect(`/edit-room/${req.params.roomId}`);
        });
    } else {
      res.redirect(`/room/${req.params.roomId}`);
    }
  } else {
    res.redirect("/");
  }
});

// POST Delete room from the smart building
app.post("/delete-room/:roomId", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.access == "admin") {
      let requestURL = `${API_URL}/locations/${req.params.roomId}`;
      axios
        .delete(requestURL)
        .then((response) => {
          res.redirect("/home");
        })
        .catch((error) => {
          res.redirect("/home");
        });
    } else {
      res.redirect(`/room/${req.params.roomId}`);
    }
  } else {
    res.redirect("/");
  }
});

// GET Users page for displaying and upgrading (only for admin) users
app.get("/users", (req, res) => {
  if (req.isAuthenticated()) {
    User.find({}, "name email access")
      .then((response) => {
        let admin_users = [];
        let basic_users = [];
        response.forEach((user) => {
          if (user.access == "admin") {
            admin_users.push(user);
          }
        });
        response.forEach((user) => {
          if (user.access == "basic") {
            basic_users.push(user);
          }
        });
        res.render("users", {
          name: req.user.name,
          access: req.user.access,
          admin_users: admin_users,
          basic_users: basic_users,
          error_message: "NONE",
        });
      })
      .catch((error) => {
        res.render("users", {
          name: req.user.name,
          access: req.user.access,
          admin_users: [],
          basic_users: [],
          error_message: "ERROR",
        });
      });
  } else {
    res.redirect("/");
  }
});

// POST Upgrade users
app.post("/upgrade-users", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.access == "admin") {
      // Upgrade users access
      User.updateMany({ _id: { $in: req.body.userIds } }, { access: "admin" })
        .then((response) => {
          res.send("UPGRADE DONE");
        })
        .catch((error) => {
          res.send("UPGRADE ERROR");
        });
    } else {
      res.send("/devices");
    }
  } else {
    res.redirect("/");
  }
});

// GET Devices page for displaying devices
app.get("/devices", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("devices", {
      access: req.user.access,
      name: req.user.name,
    });
  } else {
    res.redirect("/");
  }
});

// GET Add devices page for adding new devices
app.get("/add-devices", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.access == "admin") {
      let error_display = "none";
      let error_message = "";
      res.render("add-devices", {
        name: req.user.name,
        error_display: error_display,
        error_message: error_message,
      });
    } else {
      res.redirect("/devices");
    }
  } else {
    res.redirect("/");
  }
});

// POST Add new devices to the smart building
app.post("/add-devices", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.access == "admin") {
      let requestURL;
      if (sensors.includes(req.body.deviceType)) {
        requestURL = `${API_URL}/sensors/${req.body.deviceType}`;
      } else if (actuators.includes(req.body.deviceType)) {
        requestURL = `${API_URL}/actuators/${req.body.deviceType}`;
      }
      axios
        .post(requestURL, req.body)
        .then((response) => {
          if (response.data == "New Device Added") {
            res.redirect("/devices");
          } else if (response.data == "Device ID must be unique.") {
            let error_display = "inline-block";
            let error_message = `Device ID must be unique.`;
            res.render("add-devices", {
              name: req.user.name,
              error_display: error_display,
              error_message: error_message,
            });
          }
        })
        .catch((error) => {
          let error_display = "inline-block";
          let error_message = "Error occured while saving new device.";
          res.render("add-devices", {
            name: req.user.name,
            error_display: error_display,
            error_message: error_message,
          });
        });
    } else {
      let error_display = "inline-block";
      let error_message = "Unauthorized request.";
      res.render("add-devices", {
        name: req.user.name,
        error_display: error_display,
        error_message: error_message,
      });
    }
  } else {
    res.redirect("/");
  }
});

// GET Delete devices page for deleting devices
app.get("/delete-devices/:deviceType", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.access == "admin") {
      let requestURL;
      if (sensors.includes(req.params.deviceType)) {
        requestURL = `${API_URL}/sensors/${req.params.deviceType}`;
      } else if (actuators.includes(req.params.deviceType)) {
        requestURL = `${API_URL}/actuators/${req.params.deviceType}`;
      }
      axios
        .get(requestURL)
        .then((response) => {
          let deviceList = [];
          response.data.forEach((device) => {
            if (device.location == null) {
              deviceList.push(device);
            }
          });
          res.render("delete-devices", {
            name: req.user.name,
            deviceList: deviceList,
            devType: req.params.deviceType,
            error_message: "None",
          });
        })
        .catch((error) => {
          res.render("delete-devices", {
            name: req.user.name,
            devType: req.params.deviceType,
            error_message: "Error",
          });
        });
    }
    // If the user is not an admin, redirect to the devices page
    else {
      res.redirect("/devices");
    }
  }
  // If the user is not logged in, redirect to welcome page
  else {
    res.redirect("/");
  }
});

// POST Delete devices
app.post("/delete-devices/:deviceType", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.access == "admin") {
      let requestURL;
      if (sensors.includes(req.params.deviceType)) {
        requestURL = `${API_URL}/delete/sensors/${req.params.deviceType}`;
      } else if (actuators.includes(req.params.deviceType)) {
        requestURL = `${API_URL}/delete/actuators/${req.params.deviceType}`;
      }
      axios
        .post(requestURL, req.body)
        .then((response) => {
          res.send("DELETION DONE");
        })
        .catch((error) => {
          res.send("DELETION ERROR");
        });
    }
    // If the user is not an admin, redirect to the devices page
    else {
      res.redirect("/devices");
    }
  }
  // If the user is not logged in, redirect to welcome page
  else {
    res.redirect("/");
  }
});

// POST Change state of lights in the room
app.post("/light-state/:roomId", (req, res) => {
  if (req.isAuthenticated()) {
    const colour = req.body.light_colour;
    const brightness = req.body.light_brightness;
    const mode = req.body.light_mode;
    let on = false;
    if (req.body.light_state) {
      on = true;
    }
    let preference_user = null;
    if (req.body.light_mode == "Preference") {
      preference_user = req.user.id;
    }
    const newLightState = {
      on,
      colour,
      brightness,
      mode,
      preference_user,
    };
    let requestURL = `${MQTT_API}/light-state/${req.params.roomId}`;
    axios
      .post(requestURL, newLightState)
      .then((response) => {
        res.redirect(`/room/${req.params.roomId}`);
      })
      .catch((error) => {
        res.redirect(`/room/${req.params.roomId}`);
      });
  } else {
    res.redirect("/");
  }
});

// POST Change state of air conditioners in the room
app.post("/aircon-state/:roomId", (req, res) => {
  if (req.isAuthenticated()) {
    const aircon_temp = req.body.aircon_temp;
    const mode = req.body.aircon_mode;
    let on = false;
    if (req.body.aircon_state) {
      on = true;
    }
    let preference_user = null;
    if (req.body.light_mode == "Preference") {
      preference_user = req.user.id;
    }
    const newAirconState = {
      on,
      aircon_temp,
      mode,
      preference_user,
    };
    let requestURL = `${MQTT_API}/aircon-state/${req.params.roomId}`;
    axios
      .post(requestURL, newAirconState)
      .then((response) => {
        res.redirect(`/room/${req.params.roomId}`);
      })
      .catch((error) => {
        res.redirect(`/room/${req.params.roomId}`);
      });
  } else {
    res.redirect("/");
  }
});

// POST Set user's preferences for the room
app.post("/preferences/:roomId", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.access == "admin") {
      let pref = {};
      if (req.body.pref_state == "on") {
        pref.isActive = true;
      } else {
        pref.isActive = false;
      }

      if (req.body.pref_brightness) {
        pref.brightness = req.body.pref_brightness;
      }
      if (req.body.pref_colour) {
        pref.colour = req.body.pref_colour;
      }
      if (req.body.pref_temp) {
        pref.temperature = req.body.pref_temp;
      }
      let requestURL = `${API_URL}/preferences/${req.user.id}/${req.params.roomId}`;
      axios
        .post(requestURL, pref)
        .then((response) => {
          res.redirect(`/room/${req.params.roomId}`);
        })
        .catch((error) => {
          res.redirect(`/room/${req.params.roomId}`);
        });
    }
  }
});

// Run server on port 3000
app.listen(port, () => {
  console.log(`Main Server running on port ${port}`);
});
