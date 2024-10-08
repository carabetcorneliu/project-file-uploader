const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const { ensureAuthenticated } = require('../middleware/auth');
const fileRouter = require('./fileRouter');

router.get('/', ensureAuthenticated, folderController.listFolders);
router.get('/create', ensureAuthenticated, folderController.createFolderGet);
router.post('/create', ensureAuthenticated, folderController.createFolderPost);
router.get('/:id/edit', ensureAuthenticated, folderController.editFolderGet);
router.post('/:id/edit', ensureAuthenticated, folderController.editFolderPost);
router.post('/:id/delete', ensureAuthenticated, folderController.deleteFolderPost);

// Mount the File Router as a sub-router under /folders/:folderId/files
router.use('/:folderId/files', fileRouter);

module.exports = router;