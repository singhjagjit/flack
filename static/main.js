document.addEventListener("DOMContentLoaded", () => {
  const chatMsg = document.querySelector(".chat-messages");
  const chatForm = document.querySelector("#chat-form");
  const joinChat = document.querySelectorAll("#joinChat button");
  const leaveChat = document.querySelector("#leave");
  const channelName = document.querySelector("#channel-name");
  const chatBox = document.querySelector("#chat-box");
  const joinBox = document.querySelector("#join-box");
  const channelList = document.querySelectorAll(".channel-list");
  const lastChannel = localStorage.getItem("lastChannel");
  var clicked = false;

  const socket = io();

  if (localStorage.getItem("username") == null) {
    var username = prompt("Enter your name:");
    localStorage.setItem("username", username);
  } else {
    var username = localStorage.getItem("username");
  }

  if (lastChannel != null) {
    for(i=0; i<channelList.length; i++){
      if(channelList[i].textContent == lastChannel){
        channelList[i].click();
        break;
      }
    }
  }

  if (joinChat) {
    for (i = 0; i < joinChat.length; i++) {
      joinChat[i].addEventListener("click", function () {
        chatBox.style.display = "block";
        joinBox.style.display = "none";
        const channel = this.textContent;
        channelName.textContent = channel;
        socket.emit("joinRoom", { username, channel });
        socket.emit("getMessages", channel);
        localStorage.setItem("lastChannel", channel);
      });
    }
  }

  if (leaveChat) {
    leaveChat.addEventListener("click", () => {
      chatBox.style.display = "none";
      joinBox.style.display = "block";
      document.querySelector(".chat-messages").innerHTML = '';
      const channel = channelName.textContent;
      socket.emit('leaveRoom', { username, channel })
      localStorage.removeItem("lastChannel");
    })
  }

  socket.on("message", (message) => {
    console.log(message);
    outputMessage(message);
    chatMsg.scrollTop = chatMsg.scrollHeight;
    
  });

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const msg = e.target.elements.msg.value;

      const channel = channelName.textContent;

      socket.emit("chatMessage", { username, msg, channel });

      e.target.elements.msg.value = "";
      e.target.elements.msg.focus();
    });
  }

  function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p><p class="text">${message.message}</p>`;
    chatMsg.insertAdjacentElement('beforeend', div);
  }

});
