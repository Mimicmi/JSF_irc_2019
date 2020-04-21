const socket = io ('http://localhost:3000');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');
const roomContainer = document.getElementById('room-container');

if (messageForm != null) {
    const name = prompt('Please write your nickname');

    /*When current user join room, add new user*/
    appendMessage('You joined the room');
    socket.emit('new-user', roomName, name);


    /*stop refreshing everytime we press the SEND button*/
    messageForm.addEventListener('submit', e => {
        const message = messageInput.value;

        e.preventDefault();

        appendMessage(`You: ${message}`);
        socket.emit('send-chat-message', roomName, message);
        messageInput.value = '';
    });
}

socket.on('room-created', room => {
    const roomElement = document.createElement('div');

    roomElement.innerText = room;

    const roomLink = document.createElement('a');
    roomLink.href = `/${room}`;
    roomLink.innerText = 'join';
    roomContainer.append(roomElement);
    roomContainer.append(roomLink);
});

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`);
});

/*Add randomizer variable to say different hello*/
socket.on('user-connected', name => {
    appendMessage(`${name} joined the room !`);
});

/*Delete user from array when user disconnect*/
socket.on('user-disconnected', name => {
   appendMessage(`${name} disconnected`);
});

/*display message on screen*/
function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}
