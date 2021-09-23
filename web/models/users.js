const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  access: String,
  location: String,
  preferences: [
    {
      locationId: String,
      isActive: Boolean,
      light: {
        colour: String,
        brightness: String,
      },
      aircon: {
        temperature: Number,
      },
    },
  ],
});

module.exports = new mongoose.model("User", UserSchema);
