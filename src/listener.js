module.exports = {

    _users: [],
    _io: null,

    listen: function(io) {
        this._io = io;
        this._io.on("connection", (socket) => {
            socket.on("disconnect", () => {
                console.log("closed", socket.id);
                this.removeUser(socket.id);
                this.broadcast("update_online", this._users);
                this.broadcast("update_online_chat", this._users);
            });
            socket.on("send_message", (meta) => {
                let send = {
                    from: this.findSocket(socket.id),
                    message: meta.message
                }
                this._io.sockets.connected[meta.to.socketid].emit("new_message", send);
            });
        });
    },

    addUser: function(user) {
        if(user.socketid) {
            if(!this.findUser(user.id)) {
                this._users.push(user);
                this.broadcast("update_online", this._users);
                this.broadcast("update_online_chat", this._users);
                this.log_user();
                return true;
            }
        }
        return false;
    },

    removeUser: function(socketid) {
        for(let i = 0; i < this._users.length; i++) {
            if(socketid === this._users[i].socketid) {
                this._users.splice(i, 1);
                this.broadcast("update_online", this._users);
                this.broadcast("update_online_chat", this._users);
                this.log_user();
                return true;
            }
        }
        return false;
    },

    logoutUser: function(id) {
        for(let i = 0; i < this._users.length; i++) {
            if(id === this._users[i].id) {
                this._users.splice(i, 1);
                this.broadcast("update_online", this._users);
                this.broadcast("update_online_chat", this._users);
                this.log_user();
                return true;
            }
        }
        return false;
    },

    findUser: function(id) {
        for(let i = 0; i < this._users.length; i++) {
            if(id === this._users[i].id) {
                return this._users[i];
            }
        }
        return false;
    },

    findSocket: function(socketid) {
        for(let i = 0; i < this._users.length; i++) {
            if(socketid === this._users[i].socketid) {
                return this._users[i];
            }
        }
        return false;
    },

    broadcast: function(event, data) {
        this._io.emit(event, data);
    },

    log_user: function() {
        console.log(`User online`, this._users);
    }

}