const express = require("express");
const { registerUser, loginUser, allUsers } = require("../controllers/userController");
const {protect} = require("../middleware/authMiddleware")
const router = express.Router();

router.route('/register').post(registerUser)
router.post('/login',loginUser)
router.route('/').get(protect,allUsers)
module.exports = router;