const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  roles: [{ type: String, default: "Employee" }],
  active: { type: Boolean, dafault: true },
});

module.exports = mongoose.model("User", userSchema);
