const mongoose = require("mongoose");

const ActuatorSchema = new mongoose.Schema({
  _id: String,
  name: String,
  manufacturer: String,
  product_name: String,
  location: Object,
  state: Array,
  type: String,
});

module.exports = new mongoose.model("Actuator", ActuatorSchema);
