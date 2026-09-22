const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validator');

router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);

module.exports = router;
