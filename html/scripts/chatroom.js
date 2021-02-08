var messages = []
var lastmessage = "";
var lasttextbox = "";
var options = {
    "playding": false,
    "displayico": true,
    "displayuser": true
}

$(function () {
    var socket = io();
    var x = document.getElementById("myAudio");

    $('#m').focus()
    document.onkeyup = (e) => {
       if (e.keyCode == 190) {
           $('#m').focus()
       }
    }

    setInterval(() => {
        if (lasttextbox != $('#m').val()) {
            console.log("typing")
            socket.emit('chatroom', {"token": document.cookie.split("=")[1], "type": "istyping"})
        }
        lasttextbox = $('#m').val()
    }, 700)

    $('form').submit(function(e) {
        socket.emit('chatroom', {"text": $('#m').val(), "token": document.cookie.split("=")[1], "type": "recmsg"}); //emit the value   
        lastmessage = $("#m").val()
        $("#m").val("") 
        return false; //idfk
    });

    socket.on("chatroom", (msg) => {
        //vars
        let type = msg.type;
        let sendername = msg.sendername;
        let senderusername = msg.senderusername;
        let sendericon = msg.sendericon;
        let text = msg.text
        
        //if new msg
        if (type == "newmsg") {
            
            //2d array for messages
            messages.push([sendername, senderusername, text, sendericon])
            renderChat(messages)
            
            if (lastmessage != text && options.playding == true) {
                x.play()
                console.log("playing ding")
            }
        }
    })
});

function renderChat(array) {
    $("#messages").html("")
    array.forEach(element => {
        let string = "";

        //if user wants icons to be displayed
        if (options.displayico) {
            string += '<img src="' + element[3] + '" width="16" height="16">'
        }

        //puts Name
        string += '<h3 style="vertical-align:middle; display:inline;">' + element[0] + " "

        //if user wants username shown
        if (options.displayuser) {
            string += " (" + element[1] + ") "
        }

        //put text
        string += "> </h3>" + escapeHtml(element[2]) 

        $('#messages').append($('<li>').html(string));
    });
}

function updateSettings() {
    options.displayico = document.getElementById('displayico').checked
    options.playding = document.getElementById('playding').checked
    options.displayuser = document.getElementById('displayuser').checked
    renderChat(messages)
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}