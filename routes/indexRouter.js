const { Router } = require('express');
const router = Router();
const indexController = require('../controllers/indexController');
const authRouter = require('./authRouter');
const folderRouter = require('./folderRouter')
const fileRouter = require('./fileRouter');

// Main Route
router.get('/', indexController.indexGet);
router.get('/about', indexController.aboutGet);

// Sub Routes
router.use('/auth', authRouter);
router.use('/folders', folderRouter);
router.use('/files', fileRouter);

module.exports = router;