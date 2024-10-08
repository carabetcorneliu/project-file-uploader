const { Router } = require('express');
const router = Router();
const upload = require('../config/uploadConfig');
const uploadController = require('../controllers/uploadController');

router.get('/upload', uploadController.uploadGet)
router.post('/upload', upload.single('upload_file'), uploadController.uploadPost);

module.exports = router;