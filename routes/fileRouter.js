const express = require('express');
const router = express.Router({ mergeParams: true });       // for nested Routes handling
const fileController = require('../controllers/fileController');
const upload = require('../config/uploadConfig');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, fileController.listFiles);
router.get('/upload', ensureAuthenticated, fileController.uploadFileGet);
router.post('/upload', ensureAuthenticated, upload.single('upload_file'), fileController.uploadFilePost);
router.get('/:id/details', ensureAuthenticated, fileController.detailsGet);
router.get('/:id/edit', ensureAuthenticated, fileController.editFileGet);
router.post('/:id/edit', ensureAuthenticated, fileController.editFilePost);
router.post('/:id/delete', ensureAuthenticated, fileController.deleteFilePost);
router.get('/:id/download', ensureAuthenticated, fileController.downloadFileGet);

module.exports = router;