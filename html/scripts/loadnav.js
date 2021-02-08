$(function () {
    var socket = io();

    socket.emit('loadnav', {"loadnav": true})

    socket.on("loadnav", (msg) => {
        msg.forEach(index => {
            if (window.location.pathname.split("/")[window.location.pathname.split("/").length-2] != "webpages") {
                if (window.location.pathname.split("/")[window.location.pathname.split("/").length-1] == index.pagepath.split("/")[index.pagepath.split("/").length-1]) {
                    $("#links").append("<li><a href='' class='selected'>" + index.pagename + "</a></li>")
                } else {
                    $("#links").append("<li><a href='../" + index.pagepath + "'>" + index.pagename + "</a></li>")
                }
            } else {
                if (window.location.pathname.split("/")[window.location.pathname.split("/").length-1] == index.pagepath) {
                    $("#links").append("<li><a href='' class='selected'>" + index.pagename + "</a></li>")
                } else {
                    $("#links").append("<li><a href='" + index.pagepath + "'>" + index.pagename + "</a></li>")
                }
            }
            
        });
    })
});