const BabiliPlugin = require("babili-webpack-plugin");

module.exports = {
    entry:  __dirname + "/app/src/main.js",
    output: {
        path: __dirname + "/app/dist",
        filename: "main.js"
    },
    target: 'node-webkit',
    // plugins: [
    //     new BabiliPlugin()
    // ]
};
