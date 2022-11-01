const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc GET all users
// @route Get /users
// @access private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users) return res.status(400).json({ message: "No Users found" });

  return res.json(users);
});

// @desc Create new user
// @route POST /users
// @access private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // Confirm  data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields is required" });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate) return res.status(409).json({ message: "Duplicate username" });

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject = { username, password: hashedPwd, roles };

  // Create and store new user
  const user = await User.create(userObject);
  if (user) {
    // created
    return res.status(201).json({ message: `New user ${username} crated` });
  } else {
    return res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc UPDATE a user
// @route PATCH /users
// @access private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();
  if (!user) return res.status(400).json({ message: "User not found" });

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();
  // Allow update to original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) user.password = await bcrypt.hash(password, 10); // salt rounds

  const updatedUser = await user.save();

  return res.json({ message: `${updatedUser.username} updated` });
});

// @desc DELETE new user
// @route DELETE /users
// @access private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "User ID reequired" });

  const notes = await Note.findOne({ user: id }).lean().exec();
  if (notes?.length)
    return res.status(400).json({ message: "User has assigned notes" });

  const user = await User.findById(id).exec();
  if (!user) return res.status(400).json({ message: "User not found" });

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  return es.json(reply);
});

module.export = { getAllUsers, createNewUser, updateUser, deleteUser };
