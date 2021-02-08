module.exports = function (socket, msg, con) {
    //sends nav
    if (msg.loadnav == true) {
        con.query("SELECT * FROM `pages`", function (err, result) {
            if (err) throw err;
            socket.emit('loadnav', result)
        });
    }
}