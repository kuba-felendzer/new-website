var passwordHash = require('password-hash');
var Jimp = require('jimp');
var chalk = require('chalk')

exports.login = login;
exports.signup = signup;
exports.verify = verify;

var regex = /'|"|`|\\|\//g;

function login(socket, msg, con, tokens) {
    let username = msg.username;
    let password = msg.password;
    console.log(chalk.gray(`User ${username} is trying to Authenticate`))
    if (username != "" && password != "" && regex.test(username) != true && regex.test(password) != true) {
        con.query("select * from `login` where username='" + username + "'", (err, res) =>{
            if (err) throw err;
            //check if the username exist
            if (res.length > 0) {
                //verify the password
                if (passwordHash.verify(password, res[0].hash)) {

                    //check if already logged in if not generate token
                    let authedhashes = []
                    tokens.forEach(element => {
                        authedhashes.push(element[0])
                    });

                    if (authedhashes.includes(res[0].hash) != true) {
                        //generates token 
                        let token = require("crypto").randomBytes(10).toString('hex');

                        //add to authenticated users pool
                        tokens.push([res[0].hash, token, username, res[0].name])

                        socket.emit('login', { "success": true, "token": token})
                        console.log(chalk.green(`User ${username} has sussecfully authenticated!`))
                    } else {
                        let token = "";
                        tokens.forEach(element => {
                            if (element[0] == res[0].hash) {
                                token = element[1]
                            }
                        });
                        socket.emit('login', { "success": true, "token": token })
                    }
                
                } else {
                    console.log(chalk.red(`User ${username} failed to Authenticate`))
                    socket.emit('login', {"success": false, "errmsg": "Wrong username or password"})
                }
            } else {
                console.log(chalk.red(`User ${username} failed to Authenticate`))
                socket.emit('login', {"success": false, "errmsg": "Wrong username or password"})
            }
        })
    } else {
        console.log(chalk.red(`User ${username} failed to Authenticate`))
        socket.emit('login', {"success": false, "errmsg": "No special chars"})
    }
}

function signup(socket, msg, con) {
    //store local vals
    let name = msg.name;
    let username = msg.username;
    let password = msg.password;

    //check input
    if (name != "" && username != "" && password != "" && regex.test(name) != true && regex.test(username) != true && regex.test(password) != true) {
        let hash = passwordHash.generate(password);

        //check if account already exist
        con.query("SELECT * FROM `login` WHERE name='" + name + "' AND username='" + username + "'", (err, res) => {
            if (err) throw err;

            //if not do code
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

                //reads mask
                Jimp.read(__dirname + "/mask.png").then((mask) =>{
                    new Jimp(256, 256, 'white', (err, image) => {
                        if (err) throw err;
                    
                        //loads font
                        Jimp.loadFont(Jimp.FONT_SANS_128_WHITE).then((font) =>{
                            //scans picture
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
                        
                            //circle it then base64 then send it to the browser
                            image.mask(mask, 0, 0).getBase64(Jimp.AUTO, (err, res) => {
                                con.query("INSERT INTO login (id, name, username, hash, base64icon) VALUES (null, '" + name + "', '" + username + "', '" + hash + "', '" + res + "')", function (err, result) {
                                    if (err) throw err;
                                    socket.emit('signup', {"success": true})
                                });
                            }) 
                        })
                    })
                })
            } else {
                socket.emit('signup', {"success": false, "errmsg": "Account already exist"})
            }
        })
    } else {
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
            if (element[1] == token) {
                found = true;
            }
        });
    }
    return found;
}