const {verify, getUserInfo} = require("./loginsys");

module.exports = function (io, msg, tokens, con) {
    let token = msg.token;
    let type = msg.type;

    if (verify(tokens, token)) {
        //diffrent functions
        switch(type) {
            case "recmsg":
                //text var
                let text = msg.text;
                if (text != "") {
                    //gets user info
                    let data = getUserInfo(token, tokens)
                    //get picture
                    con.query("SELECT * FROM `login` WHERE hash='" + data[0] + "'", (err, res) => {
                        if (err) throw err;
                        //send object
                        io.emit("chatroom", {"type": "newmsg", "sendername": data[3], "senderusername": data[2], "text": text, "sendericon": res[0].base64icon})
                    })
                }
                break;
            case "istyping":

                break;
        }
    }
}

