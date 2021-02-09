//http server
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser')

//mysql
const mysql = require('mysql')

//chalk
const chalk = require("chalk")

//me files
const loginsys = require("./loginsys")
const getNav = require("./getnav.js")
const ips = require("./ips.json")
const chatroom = require("./chatroom.js")

//add cookie parser
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

console.log(chalk.green("Connected to db"))

con.on('error', (err) => {
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        setTimeout(() => { console.log(chalk.yellow("Reconnecting to DB server")); con = mysql.createConnection(sql); }, 2000)
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
    console.log(chalk.yellow('listening on *:80'));
});


//socket.io shit
io.on('connection', (socket) => {
    socket.on('login', (msg) => {
        loginsys.login(socket, msg, con, tokens)
    })

    socket.on('signup', (msg) => {
        loginsys.signup(socket, msg, con, tokens)
    })

    socket.on('loadnav', (msg) => {
        getNav(socket, msg, con)
    })

    socket.on('chatroom', (msg)=> {
        chatroom(io, msg, tokens, con);
    })
})