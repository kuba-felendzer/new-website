//http server
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser')

//mysql
const mysql = require('mysql')

//me files
const loginsys = require("./loginsys")
const getnav = require("./getnav.js")
const ips = require("./ips.json")

app.use(cookieParser())

var tokens = []

//sql auth info
var sql = {
    host: "localhost",
    user: "root",
    password: "8212",
    database: "website"
};
var con = mysql.createConnection(sql)
console.log("connected to db")
con.on('error', (err) => {
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        setTimeout(() => { console.log("Reconnecting to DB server"); con = mysql.createConnection(sql); }, 2000)
    } else {
        throw err;
    }
})

//router
app.get("*", (req, res)=> {
    //req ip
    let reqip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace("::ffff:", "")

    function ifauth(redir) {
        if (loginsys.verify(tokens, req.cookies.token)) {
            res.sendFile(__dirname + redir)
        } else {
            res.sendFile(__dirname + "/html/webpages/notok.html")
        }
    }

    if (!ips.includes(reqip)) {
        switch (req._parsedUrl.pathname) {
            case "/api":
                console.log("api call");
                res.send("API")
                break;
            case "/webpages/chatroom/chatroom.html":

                //if authed go to this page
                ifauth("/html/webpages/chatroom/chatroom.html");
                break;
            case "/webpages/chatroom/chatroomiframe.html":
                
                //if authed go to this page
                ifauth("/html/webpages/chatroom/chatroomiframe.html")
                break;
            default:
                if (req._parsedUrl.pathname.includes(".")) {
                    res.sendFile(__dirname + "/html" + req._parsedUrl.pathname);
                } else {
                    res.sendFile(__dirname + "/html" + req._parsedUrl.pathname + "/index.html")
                }
            }
    } else {
        console.log(ip + " Tried to access webpage " + req._parsedUrl.pathname)
        res.send("FUCK OFF BITCH")
    }
})

//starts server
http.listen(80, () => {
    console.log('listening on *:80');
});


//socket.io shit
io.on('connection', (socket) => {
    socket.on('login', (msg) => {
        //login(socket, msg)
        loginsys.login(socket, msg, con, tokens)
    })
    socket.on('signup', (msg) => {
        //signup(socket, msg)
        loginsys.signup(socket, msg, con, tokens)
    })
    socket.on('loadnav', (msg) => {
        getnav.getNav(socket, msg, con)
    })
    socket.on('chatroom', (msg)=> {
        loginsys.chatroom(io, msg, tokens, con);
    })
})