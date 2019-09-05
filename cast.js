module.exports = function(app) {
    app.get("/cast", (req, res, next) => {
     res.json({ "stuff": "yarp" });
    });
};

