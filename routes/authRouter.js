const { Router } = require('express');
const router = Router();
const authController = require('../controllers/authController');

router.get('/register', authController.registerGet);
router.post('/register', authController.registerPost);
router.get('/login', authController.loginGet);
router.post('/login', authController.loginPost);
router.get('/logout', authController.logoutGet);

module.exports = router;