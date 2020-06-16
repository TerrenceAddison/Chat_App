



  document.addEventListener("DOMContentLoaded", () => {
    const document_body = document.querySelector("body");
    const message_input = document.querySelector("#messagebox");
    const current_user = document.querySelector(".headusername");
    const channel_name = document.querySelector(".headchannelname"); //.channel-name
    const add_channel = document.querySelector("#addChannel"); //#create_channel
    const channelList = document.querySelectorAll(".channelListitem");
    const add_channel_link = document.querySelector("#addChannelLink");
    const messagecontainer = document.querySelector(".chatbox"); //body-content-messgaes
    messagecontainer.scrollTop = messagecontainer.scrollHeight;
    const socketio = io.connect( `${location.protocol}//${location.hostname}:${location.port}`);
    document_body.style.height = `${window.innerHeight}px`;
    document_body.style.width = `${window.innerWidth}px`;
    socketio.on("connect", () =>
      onConnect(
        socketio,
        message_input,
        current_user,
        add_channel,
        add_channel_link,
        channel_name,
        channelList,
      )
    );
    socketio.on("Receiver", (value) => newChannel(value, current_user));
    socketio.on("msgreceiver", (value) =>msgreceiver(value, current_user, messagecontainer, channel_name));
    socketio.on("isTypingReceiver", (value) => isTyping(value, current_user, channel_name));
    socketio.on("isNotTypingReceiver", (value) =>isNotTyping(value, channel_name));
    socketio.on("joinChannelReceiver", (value) =>joinChannel(value, current_user));



  });
  
  const onConnect = (
    _socketio,
    _message_input,
    _current_user,
    _add_channel,
    _add_channel_link,
    _channel_name,
    _channelList,
  ) => {
    _message_input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (this.value.trim().length >= 1) {
          var d = new Date();
          var _time = {
            year: d.getFullYear(),
            month: d.getMonth() < 10 ? `0${d.getMonth()}` : d.getMonth(),
            date: d.getDate() < 10 ? `0${d.getDate()}` : d.getDate(),
            hours: d.getHours() < 10 ? `0${d.getHours()}` : d.getHours(),
            minutes: d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes(),
            seconds: d.getSeconds() < 10 ? `0${d.getSeconds()}` : d.getSeconds(),
          };
          _socketio.emit("sendMessage", {message: this.value.trim(),channel: _channel_name.innerText,time: _time,});//messagesend
          this.value = "";
        }
      }
  });
    _message_input.addEventListener("keydown", () => { _socketio.emit("isTyping", { user: _current_user.innerText});});
    _message_input.addEventListener("keyup", () => {setTimeout(() => {_socketio.emit("isNotTyping", {user: _current_user.innerText,});}, 3000);});
    _add_channel.addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (this.value.trim().length >= 1) {
          _socketio.emit("newChannel", {
            channel: this.value.trim(),
          });
        }
        this.value = "";
      }
    });
    _channelList.forEach((element) => {
      element.addEventListener("click", function () {
        var channelListName = this.childNodes[1].childNodes[1];
        var confirmJoin = confirm(
          `Are you sure you want to join ${channelListName.innerText} ?`
        );
        if (confirmJoin) {
          _socketio.emit("joinChannel", {
            channel: channelListName.innerText.trim(),
            username: _current_user.innerText.trim(),
          });
        }
      });
    });
  };

  const newChannel = (value, _current_user) => {
    if (value.newChannel == "null") {
      if (value.user == _current_user.innerText) {
        alert("Channel Already Exist");
      }
    } else {
      document.location.href = `${location.protocol}//${location.hostname}:${location.port}/channels/${value.newChannel}`;
    }
  };
  const joinChannel = (value, _current_user) => {
    if (value.newChannel == "null") {
      if (value.user == _current_user.innerText) {
        alert("You are already in this channel!");
      }
    } else {
      document.location.href = `${location.protocol}//${location.hostname}:${location.port}/channels/${value.newChannel}`;
    }
  };
  const isTyping = (value, _current_user, _channel_name) => {
    if (value.channel == _channel_name.innerText) {
      if (_current_user.innerText != value.user) {
        document.querySelector(
          ".typingornot"
        ).innerText = ` ${value.user} is typing...`;
      }
    }
  };
  const isNotTyping = (value, _channel_name) => {
    if (value.channel == _channel_name.innerText) {
      document.querySelector(".typingornot").innerText = "";
    }
  };
  const msgreceiver = (
    value,
    _current_user,
    _messagecontainer,
    _channel_name
  ) => {
    if (value.messagecontent.channel == _channel_name.innerText) {
      if (value.messagecontent.username != _current_user.innerText) {
        _messagecontainer.innerHTML += `
                <div class ="">
                        <div>
                            <p class="message"><b>${value.messagecontent.username}</b>
                            <small class="message">${value.messagecontent.time.hours}:${value.messagecontent.time.minutes}</small></p>
                        </div>
                        <div>
                            <p>${value.messagecontent.message}</p>
                        </div>
                </div>`;
      } else {
        _messagecontainer.innerHTML += `
            <div class="">

                    <div class="text-right message">
                    <p class=" text-right message">  
                      <small class="text-right">${value.messagecontent.time.hours}:${value.messagecontent.time.minutes}</small>
                        <b>${value.messagecontent.username}</b></p>
                    </div>
                    <div>
                        <p class="text-right message">${value.messagecontent.message}</p>
                    </div>
            </div>`;
      }
      _messagecontainer.scrollTop = _messagecontainer.scrollHeight;
    }
  };
  