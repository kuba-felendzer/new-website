const fs = require("fs")

module.exports = function (socket, msg, con) {
    //sends nav
    if (msg.loadnav == true) {
        //adapt, improvise, overcome
        var data = []
        var pages = JSON.parse(fs.readFileSync("storage/pages.json"))

        pages.forEach(element => {
            data.push({"pagename": element[0], "pagepath": element[1] });
        });

        socket.emit('loadnav', data)
    }
}