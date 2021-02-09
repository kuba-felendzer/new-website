const fs = require("fs")

module.exports = function (socket, msg) {
    //sends nav data
    if (msg.loadnav == true) {
        //adapt, improvise, overcome
        var pages = JSON.parse(fs.readFileSync("storage/pages.json"))

        socket.emit('loadnav', pages)
    }
}