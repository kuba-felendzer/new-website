const fs = require("fs")

module.exports = function (socket, msg, con) {
    //sends nav
    if (msg.loadnav == true) {
        //adapt, improvise, overcome
        var pages = JSON.parse(fs.readFileSync("storage/pages.json"))

        socket.emit('loadnav', pages)
    }
}