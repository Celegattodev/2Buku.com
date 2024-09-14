const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.renderLogin);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

module.exports = router;
