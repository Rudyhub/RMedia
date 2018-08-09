const config = {
    entry:  __dirname + "/app/src/main.js",
    output: {
        path: __dirname + "/app/dist",
        filename: "main.js"
    },
    target: 'node-webkit'
};
module.exports = config;