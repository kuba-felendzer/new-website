var passwordHash = require('password-hash');
var Jimp = require('jimp');
var chalk = require('chalk')

exports.verify = verify;
exports.getUserInfo = getUserInfo;

var regex = /'|"|`|\\|\//g;

exports.login = function login(socket, msg, con, tokens) {
    let username = msg.username;
    let password = msg.password;
    console.log(chalk.gray(`User ${username} is trying to Authenticate`))

    //check if passes blank check and regex test
    if (username != "" && password != "" && regex.test(username) != true && regex.test(password) != true) {

        //check if username exists
        con.query("select * from `login` where username='" + username + "'", (err, res) =>{
            if (err) throw err;

            //check if the username exist
            if (res.length > 0) {
                //verify the password hash
                if (passwordHash.verify(password, res[0].hash)) {

                    //make list of authed usernames
                    let authedunames = []
                    tokens.forEach(element => {
                        authedunames.push(element.uname)
                    });

                    //check if already logged in if not generate token
                    if (authedunames.includes(username) != true) {
                        //generates token 
                        let token = require("crypto").randomBytes(10).toString('hex');

                        //add to authenticated users pool
                        tokens.push({"uname": username, "rname": res[0].name, "token": token, "icon": res[0].base64icon})

                        //emit the value
                        socket.emit('login', { "success": true, "token": token})
                        console.log(chalk.green(`User ${username} has sussecfully authenticated!`))

                    } else {
                        //retrives tokens from pool because user has already existing token
                        tokens.forEach(element => {
                            if (element.uname == username) {
                                socket.emit('login', { "success": true, "token": element.token })
                            }
                        });
                        
                    }
                
                } else {
                    //errmsg
                    console.log(chalk.red(`User ${username} failed to Authenticate`))
                    socket.emit('login', {"success": false, "errmsg": "Wrong username or password"})
                }
            } else {
                //errmsg
                console.log(chalk.red(`User ${username} failed to Authenticate`))
                socket.emit('login', {"success": false, "errmsg": "Wrong username or password"})
            }
        })
    } else {
        //errmsg
        console.log(chalk.red(`User ${username} failed to Authenticate`))
        socket.emit('login', {"success": false, "errmsg": "No special chars"})
    }
}

exports.signup = function signup(socket, msg, con) {
    //store some vals
    let name = msg.name;
    let username = msg.username;
    let password = msg.password;

    //check input
    if (name != "" && username != "" && password != "" && regex.test(name) != true && regex.test(username) != true && regex.test(password) != true) {
        let hash = passwordHash.generate(password);

        //check if account already exist
        con.query("SELECT * FROM `login` WHERE name='" + name + "' AND username='" + username + "'", (err, res) => {
            if (err) throw err;

            //make sure there are no accounts
            if (res.length == 0) {

                //colors array
                let colors = ["#fc0303", "#fcce03", "#03fc07", "#03ebfc", "#0303fc", "#fc03f8", "#ff800"]

                //rng to pick bottom color
                let foregroundColor = "#333333";
                let backgroundColor = colors[getRndInteger(0, colors.length)];

                //makes initials
                let initials = ""; 
                for(let i=0; i < name.split(" ").length; i++) {
                    if (i > 1) { break; }
                    initials += name.split(" ")[i][0].toUpperCase()
                }

                (async () => {
                    //wait for assets to load
                    var mask = await Jimp.read(__dirname + "/mask.png")
                    var font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);

                    //make new image
                    new Jimp(256, 256, 'white', (err, image) => {
                        if (err) throw err;

                        //draw sine wave
                        for (let x = 0; x < image.bitmap.width; x++) {
                            for (let y = 0; y < image.bitmap.height; y++) {
                                //if y is below the sinewave then draw the foregrond color
                                if (y <= (Math.sin(x/20)*20) + image.bitmap.height/2) {
                                    image.setPixelColor(Jimp.cssColorToHex(foregroundColor), x, y)
                                } else {
                                    image.setPixelColor(Jimp.cssColorToHex(backgroundColor), x, y)
                                }
                            }
                        }

                        //puts the initials on the image
                        image.print(font, 0, 0, { text: initials, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, image.bitmap.width, image.bitmap.height)

                        //mask it then base64 encode it then send it to the browser
                        image.mask(mask, 0, 0).getBase64(Jimp.AUTO, (err, res) => {
                            if (err) throw err;

                            con.query("INSERT INTO login (id, name, username, hash, base64icon) VALUES (null, '" + name + "', '" + username + "', '" + hash + "', '" + res + "')", function (err, result) {
                                if (err) throw err;

                                //send signup success
                                socket.emit('signup', {"success": true})
                                console.log(chalk.green(`User ${username} just signed up!`))
                            });
                        })
                    })
                })();
            } else {
                console.log(chalk.red(`Username ${username} failed to Signup: Account already exist`))
                socket.emit('signup', {"success": false, "errmsg": "Account already exist"})
            }
        })
    } else {
        console.log(chalk.red(`Username ${username} failed to Signup: Used special chars`))
        socket.emit("signup", {"success": false, "errmsg": "No blank boxes or special chars"})
    }
}

//rng
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

//verify function
function verify(tokens, token) {
    let found = false;
    if (typeof token != 'undefined') {
        tokens.forEach(element => {
            if (element.token == token) {
                found = true;
            }
        });
    }
    return found;
}

//loads usern info
function getUserInfo(token, tokens) {
    var data = []
    tokens.forEach(element => {
        if (element.token == token) {
            data = element;
        }
    });
    return data;
}