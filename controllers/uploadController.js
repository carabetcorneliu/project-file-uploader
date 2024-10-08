const prisma = require('../db/prisma');
const path = require('path');

function uploadGet(req, res) {
    res.render('upload', {
        title: 'Upload page',
        user: req.user,
    })
};

async function uploadPost(req, res) {
    try {
        // Multer adds the file information to req.file
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Save file to databse
        const filreRecord = await prisma.File.create({
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: req.file.path,
                mimeType: req.file.mimetype,
                size: req.file.size,
            },
        });

        res.status(201).json({
            message: 'File uploaded successfully.',
            file: filreRecord,
        });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).send('An error ocurred while uploading the file.');
    }
};

module.exports = {
    uploadGet,
    uploadPost,
}