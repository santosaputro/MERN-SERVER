const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// router
//   .route("/")
//   .get(usersController.getAllUsers)
//   .post(usersController.createNewUser)
//   .patch(usersController.updateUser)
//   .delete(usersController.deleteUser);

router.get("/users", usersController.getAllUsers);

module.exports = router;
