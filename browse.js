module.exports = function(app) {
    app.get("/browse/:path", (req, res, next) => {
     res.json({ "path": req.params['path'] });
    });
};

