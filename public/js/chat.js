// Connect to Socket.io
const socket = io("http://localhost:3000");

// Get logged-in user info
const username = localStorage.getItem("username");
const firstname = localStorage.getItem("firstname");
const lastname = localStorage.getItem("lastname");

// Display welcome message
document.getElementById("welcome").textContent =
  `Logged in as: ${firstname} ${lastname} (${username})`;

// -----------------------------
// LOAD ROOMS FROM BACKEND
// -----------------------------
async function loadRooms() {
  const response = await fetch("http://localhost:3000/rooms");
  const rooms = await response.json();

  const roomSelect = document.getElementById("roomSelect");
  roomSelect.innerHTML = "";

  rooms.forEach(room => {
    const option = document.createElement("option");
    option.value = room;
    option.textContent = room;
    roomSelect.appendChild(option);
  });
}

loadRooms();

// Track current room
let currentRoom = null;

// -----------------------------
// JOIN ROOM
// -----------------------------
document.getElementById("joinRoomBtn").addEventListener("click", async () => {
  const room = document.getElementById("roomSelect").value;

  if (currentRoom) {
    socket.emit("leaveRoom", currentRoom);
  }

  currentRoom = room;
  socket.emit("joinRoom", room);

  // Clear old messages
  const box = document.getElementById("groupMessages");
  box.innerHTML = "";

  // Load message history
  const response = await fetch(`http://localhost:3000/messages/${room}`);
  const history = await response.json();

  history.forEach(msg => {
    const p = document.createElement("p");
    p.textContent = `${msg.from_user}: ${msg.message}`;
    box.appendChild(p);
  });

  box.scrollTop = box.scrollHeight;
});

// -----------------------------
// LEAVE ROOM
// -----------------------------
document.getElementById("leaveRoomBtn").addEventListener("click", () => {
  if (currentRoom) {
    socket.emit("leaveRoom", currentRoom);
    currentRoom = null;
  }
});

// -----------------------------
// SEND GROUP MESSAGE
// -----------------------------
document.getElementById("sendGroupMessageBtn").addEventListener("click", () => {
  const message = document.getElementById("groupMessageInput").value;

  if (!currentRoom) {
    alert("Join a room first");
    return;
  }

  socket.emit("groupMessage", {
    from_user: username,
    room: currentRoom,
    message
  });

  document.getElementById("groupMessageInput").value = "";
});

// -----------------------------
// RECEIVE GROUP MESSAGE
// -----------------------------
socket.on("groupMessage", (msg) => {
  const box = document.getElementById("groupMessages");
  const p = document.createElement("p");
  p.textContent = `${msg.from_user}: ${msg.message}`;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
});

// -----------------------------
// TYPING INDICATOR
// -----------------------------
document.getElementById("groupMessageInput").addEventListener("input", () => {
  if (currentRoom) {
    socket.emit("typing", {
      room: currentRoom,
      username
    });
  }
});

socket.on("typing", (user) => {
  const indicator = document.getElementById("typingIndicator");
  indicator.textContent = `${user} is typing...`;

  setTimeout(() => {
    indicator.textContent = "";
  }, 1000);
});

// -----------------------------
// SEND PRIVATE MESSAGE
// -----------------------------
document.getElementById("sendPrivateMessageBtn").addEventListener("click", () => {
  const to_user = document.getElementById("privateToUser").value;
  const message = document.getElementById("privateMessageInput").value;

  socket.emit("privateMessage", {
    from_user: username,
    to_user,
    message
  });

  document.getElementById("privateMessageInput").value = "";
});

// -----------------------------
// RECEIVE PRIVATE MESSAGE
// -----------------------------
socket.on(`privateMessage:${username}`, (msg) => {
  const box = document.getElementById("privateMessages");
  const p = document.createElement("p");
  p.textContent = `From ${msg.from_user}: ${msg.message}`;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
});