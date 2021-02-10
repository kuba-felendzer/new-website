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

                    //broadcast the message to everyone
                    if(data.rname === data.uname) {
                        io.emit("chatroom", {"type": "newmsg", "sendername": data.rname, "text": text, "sendericon": data.icon})
                    }
                    io.emit("chatroom", {"type": "newmsg", "sendername": data.rname, "senderusername": data.uname, "text": text, "sendericon": data.icon})
                }
                break;
            case "istyping":

                break;
        }
    }
}

