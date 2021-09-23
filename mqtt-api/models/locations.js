const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
    name: String,
    floorNo: Number,
    lights: Array,
    aircons: Array,
    tempSensor: String,
    motionSensor: String,
    ambientSensor: String,
    light_state: {
        on: Boolean,
        colour: String,
        brightness: Number,
        mode: String,
    },
    aircon_state: {
        on: Boolean,
        aircon_temp: Number,
        mode: String,
    }
});


module.exports = new mongoose.model("Location", LocationSchema);
