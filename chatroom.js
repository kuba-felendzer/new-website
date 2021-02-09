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

                    io.emit("chatroom", {"type": "newmsg", "sendername": data.rname, "senderusername": data.uname, "text": text, "sendericon": data.icon})
                }
                break;
            case "istyping":

                break;
        }
    }
}

