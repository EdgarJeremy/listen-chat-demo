$(function () {

    $("#loading-page").show();
    window.socket = io();
    $online_list = $("#online-list");
    $sfx = new Audio("/appointed.mp3");

    window.socket.on("connect", () => {
        window.socketID = socket.id;
        httpGET("/cek_status").then((status) => {
            if (!status.status) {
                loginPage();
            } else {
                panelPage();
            }
        });
        window.socket.off("update_online");
        window.socket.on("update_online", (online) => {
            httpGET("/cek_status").then((status) => {
                if(status.data) {
                    var total = online.length;
                    $online_list.html("");
                    online.forEach((item, i) => {
                        if(item.id === status.data.id) { total -= 1; return; }
                        $online_list.append(`
                            <li class="list-group-item">${item.name} - ${item.id} (<a onClick='openChat(${JSON.stringify(item)})' href='#'>Chat</a>)</li>
                        `);
                    });
                    $("#total").html(total);
                }
            });
        });
        window.socket.off("new_message");
        window.socket.on("new_message", (meta) => {
            $sfx.play();
            if($("#chat-container").hasClass("hide"))
                openChat(meta.from);
            $bodyList = $(".chat-body ul");
            $bodyList.append(`
                <li class="other">
                    <div class="bubble">
                        ${meta.message}
                    </div>
                </li>
            `)
        });
    });

});


function openChat(data) {
    $overlay = $("#overlay");
    $chatContainer = $("#chat-container");
    $target = $("#target");
    $message = $("#message");
    $message.focus();
    $bodyList = $(".chat-body ul");
    $bodyList.html("");
    $overlay.fadeIn();
    $chatContainer.removeClass("hide");
    $target.html(data.name);
    
    $message.off("keydown");
    $message.on("keydown", function(e) {
        var message = $(this).val();
        if(e.keyCode === 13) {
            $(this).val("");
            /**
             * Put any `save data` implementation here
             * send the `metadata` variable to an API that handle the persistent data implementation.
             */
            var metadata = {
                message: message,
                to: data
            };
            window.socket.emit("send_message", metadata);
            $bodyList.append(`
                <li class="me">
                    <div class="bubble">
                        ${message}
                    </div>
                </li>
            `);
        }
    });
    window.socket.off("update_online_chat");
    window.socket.on("update_online_chat", (online) => {
        let cari = data.id;
        let offline = true;
        online.forEach((item, i) => {
            console.log(item, data);
            if(data.id === item.id) {
                offline = false;
            }
        });
        if(offline)
            hideChat();
    });

}

function hideChat() {
    $overlay = $("#overlay");
    $chatContainer = $("#chat-container");

    $overlay.fadeOut();
    $chatContainer.addClass("hide");
}

function loginPage() {
    $loginPage = $("#login-page");
    $panelPage = $("#panel-page");
    $loading = $("#loading-page");

    $loading.fadeOut();
    $panelPage.hide();
    $loginPage.fadeIn();

    $form = $("#form");
    $form.off("submit");
    $form.on("submit", function (ev) {
        ev.preventDefault();
        var name = $("#form input[name='name']").val();
        if (name) {
            var post = { name };
            $loading.show();
            httpPOST("/login", post).then((data) => {
                window.location.reload();
            });
        } else alert("Masukkan nama");
    });
}

function panelPage() {
    $loginPage = $("#login-page");
    $panelPage = $("#panel-page");
    $loading = $("#loading-page");
    $username = $("#username");
    $online_list = $("#online-list");

    httpGET("/cek_status").then((status) => {
        if (status.status) {
            $loading.fadeOut();
            $loginPage.hide();
            $panelPage.fadeIn();
            $username.html(status.data.name);
            $logout = $("#logout");
            $logout.off("click");
            $logout.on("click", function (ev) {
                $loading.show();
                httpGET("/logout").then((status) => {
                    loginPage();
                });
            });
        }
    });
}

function httpGET(endpoint) {
    return fetch(endpoint, {
        headers: {
            "x-socket-id": window.socketID
        },
        credentials: "same-origin"
    }).then((response) => response.json()).catch(alert);
}

function httpPOST(endpoint, data) {
    return fetch(endpoint, {
        body: JSON.stringify(data),
        headers: {
            "x-socket-id": window.socketID,
            "Content-Type": "application/json"
        },
        method: "POST",
        credentials: "same-origin"
    }).then((response) => response.json()).catch(alert);
}