const prisma = require('../db/prisma');

async function listFolders(req, res) {
    try {
        const folders = await prisma.folder.findMany({
            where: { userId: req.user.id },
            include: { files: true },
        });
        res.render('folders/list', { 
            title: 'Your Folders', 
            folders,
        });
    } catch (err) {
        console.error('Error fetcing folders:', err);
        res.status(500).send('Server error');
    }
};

function createFolderGet(req, res) {
    res.render('folders/create', { 
        title: 'Create New Folder',
    });
};

async function createFolderPost(req, res) {
    const { name } = req.body;
    try {
        await prisma.folder.create({
            data: {
                name,
                userId: req.user.id,
            },
        });
        res.redirect('/folders');
    } catch (err) {
        console.error('Error creating folder:', err);
        res.status(500).send('Server error');
    }
};

async function editFolderGet(req, res) {
    const folderId = parseInt(req.params.id);
    try {
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
        });
        if (!folder || folder.userId !== req.user.id) {
            return res.status(404).send('Folder not found');
        }
        res.render(`folders/edit`, {
            title: 'Edit Folder',
            folder,
        });
    } catch (err) {
        console.error('Error fetching folder:', err);
        res.status(500).send('Server error');
    }
};

async function editFolderPost(req, res) {
    const folderId = parseInt(req.params.id);
    const { name } = req.body;
    try {
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
        });
        if (!folder || folder.userId !== req.user.id) {
            return res.status(404).send('Folder not found');
        }
        await prisma.folder.update({
            where: { id: folderId },
            data: { name },
        });
        res.redirect('/folders');
    } catch (err) {
        console.error('Error updating folder:', err);
        res.status(500).send('Server error');
    }
};

async function deleteFolderPost(req, res) {
    const folderId = parseInt(req.paramss.id);
    try {
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
        });
        if (!folder || folder.userId !== req.user.id) {
            return res.status(404).send('Folder not found');
        }
        await prisma.file.deleteMany({
            where: { folderId },
        });
        await prisma.folder.delete({
            where: { id: folderId },
        });
        res.redirect('/folders');
    } catch (err) {
        console.error('Error deleting folder:', err);
        res.status(500).send('Server error');
    }
};

module.exports = {
    listFolders,
    createFolderGet,
    createFolderPost,
    editFolderGet,
    editFolderPost,
    deleteFolderPost,
}