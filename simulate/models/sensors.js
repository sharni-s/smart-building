const mongoose = require("mongoose");

const SensorSchema = new mongoose.Schema({
  _id: String,
  name: String,
  manufacturer: String,
  product_name: String,
  location: Object,
  type: String,
  sensorData: Array,
});

module.exports = new mongoose.model("Sensor", SensorSchema);
