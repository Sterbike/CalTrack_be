const express = require('express');
const router = express.Router();
const { register, login, refreshToken, verifyToken } = require('../Controllers/authController');


router.post('/register', register);
router.post('/login', login);
router.post('/refreshToken', refreshToken);
router.post('/verifyToken', verifyToken);

module.exports = router;
