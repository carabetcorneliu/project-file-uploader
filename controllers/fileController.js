const prisma = require('../db/prisma');
const path = require('path');
const fs = require('fs');

async function listFiles(req, res) {
    const folderId = parseInt(req.params.folderId);
    try {
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
            include: { files: true },
        });

        if (!folder || folder.userId !== req.user.id) {
            return res.status(404).send('Folder not found');
        }

        res.render('files/list', { 
            title: 'Files in ' + folder.name, 
            folder,
        });
    } catch (err) {
        console.error('Errot fetching files:', err);
        res.status(500).send('Server Error');
    }
};

async function uploadFileGet(req, res) {
    const folderId = parseInt(req.params.folderId);
    try {
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
        });

        if (!folder || folder.userId !== req.user.id) {
            return res.status(404).send('Folder not found');
        }

        res.render('files/upload', { 
            title: 'Upload File to ' + folder.name,
            folder,
        });
    } catch (err) {
        console.error('Error loading upload form: ', err);
            res.status(500).send('Server Error');;
    }
};

async function uploadFilePost(req, res) {
    const folderId = parseInt(req.params.folderId);
    try {
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
        });

        if (!folder || folder.userId !== req.user.id) {
            return res.status(404).send('Folder not found');
        }

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        await prisma.file.create({
            data: {
                filename: req.file.filename,
                path: req.file.path,
                mimeType: req.file.mimetype,
                size: req.file.size,
                folderId: folder.id,
                originalName: req.file.originalname,
            },
        });

        res.redirect(`/folders/${folder.id}/files`);
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).send('Server Error');
    }
};

async function detailsGet(req, res) {
    const fileId = parseInt(req.params.id);
    try {
        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: { folder: true },
        });

        if (!file || file.folder.userId != req.user.id) {
            return res.status(404).send('File not found');
        }

        res.render('files/details', {
            title: 'Details ' + file.name,
            file,
        })
    } catch (err) {
        console.error('Error loading file details:', err);
        res.status(500).send('Server Error');
    }
};

async function editFileGet(req, res) {
    const fileId = parseInt(req.params.id);
    try {
        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: { folder: true },
        });

        if (!file || file.folder.userId !== req.user.id) {
            return res.status(404).send('File not found');
        }

        // Compute the filename without its extension
        const fileNameWithoutExt = path.basename(file.originalName, path.extname(file.originalName));

        res.render('files/edit', {
            title: 'Edit File',
            file,
            fileNameWithoutExt,
        });
    } catch (err) {
        console.error('Error loading edit form:', err);
        res.status(500).send('Server Error');
    }
};

async function editFilePost(req, res) {
    const fileId = parseInt(req.params.id);
    const folderId = parseInt(req.params.folderId);
    const { newName } = req.body;
    try {
        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: { folder: true },
        });

        if (!file || file.folder.userId !== req.user.id) {
            return res.status(404).send('File not found');
        }

        const oldPath = path.resolve(file.path);
        const newFilename = `${newName}${path.extname(file.originalName)}`;
        const newPath = path.join(path.dirname(oldPath), newFilename);

        fs.renameSync(oldPath, newPath);

        await prisma.file.update({
            where: { id: fileId },
            data: {
                filename: newFilename,
                path: newPath,
                originalName: newFilename,
            },
        });

        res.redirect(`/folders/${folderId}/files/`);
    } catch (err) {
        console.error('Error updating file:', err);
        res.status(500).send('Server Error');
    }
};

async function deleteFilePost(req, res) {
    const fileId = parseInt(req.params.id);
    const folderId = parseInt(req.params.folderId);
    try {
        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: { folder: true },
        });

        if (!file || file.folder.userId !== req.user.id) {
            return res.status(404).send('File not found');
        }

        // Delete the file from filesystem
        fs.unlinkSync(path.resolve(file.path));

        // Delete the database record
        await prisma.file.delete({
            where: { id: fileId },
        });

        res.redirect(`/folders/${folderId}/files/`);
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).send('Server Error');
    }
};

async function downloadFileGet(req, res) {
    const fileId = parseInt(req.params.id);
    try {
        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: { folder: true },
        });

        if (!file || file.folder.userId !== req.user.id) {
            return res.status(404).send('File not found');
        }

        const filePath = path.resolve(file.path);

        // check if file exists on filesystem
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('File not found on server');
        }

        res.download(filePath, file.originalName, (err) => {
            if (err) {
                console.error('Error downloading file: ', err);
                res.status(500).send('Error downloading file');
            }
        });
    } catch (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Server error');
    }
};

module.exports = {
    listFiles,
    uploadFileGet,
    uploadFilePost,
    detailsGet,
    editFileGet,
    editFilePost,
    deleteFilePost,
    downloadFileGet,
};