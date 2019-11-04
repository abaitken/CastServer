const mDnsSd = require('node-dns-sd');

module.exports = function (app, config) {

    app.get("/discover", (req, res, next) => {
        mDnsSd.discover({
            name: '_googlecast._tcp.local'
        }).then((device_list) => {
            console.log(JSON.stringify(device_list, null, '  '));
            res.json(device_list);
        }).catch((error) => {
            console.error(error);
        });
    });

};