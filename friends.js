function getAllUsers() {
    var users = require("./storage/usrdata.json");

    var keys = Object.keys(users)
    var userdata = {}

    keys.forEach(element => {
        let tempuser = {
            [element]: {
                "rname": users[element].rname,
                "friends": users[element].friends,
                "icon": users[element].icon
            }
        }

        userdata = Object.assign(tempuser, userdata);
    })
    return userdata;
}

module.exports = (socket, msg) => {
    switch (msg.action) {
        case "getallusers":
            socket.emit('friends', getAllUsers());
        break;
    }
}