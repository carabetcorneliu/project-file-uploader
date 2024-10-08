function indexGet(req, res) {
    res.render('index', {
        title: 'File Uploader',
        user: req.user
    });
};

function aboutGet(req, res) {
    res.render('about', {
        title: 'About page',
        user: req.user
    });
}

module.exports = {
    indexGet,
    aboutGet,
}