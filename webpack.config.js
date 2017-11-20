const BabiliPlugin = require("babili-webpack-plugin");
module.exports = {
    entry:  __dirname + "/app/src/index.js",
    output: {
        path: __dirname + "/test/nwjs/app/js",
        filename: "index.js"
    },
    plugins: [
        new BabiliPlugin()
    ],
    target: 'node-webkit'
};
