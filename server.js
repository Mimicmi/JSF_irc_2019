const express = require('express');
const app = express();
/*gives server ability to contact with socket.io and make the connection*/
const server = require('http').Server(app);
const io = require('socket.io')(server);

/*Configure express server*/
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public')); /*where javascript goes*/
app.use(express.urlencoded({ extended: true })); /*allow the use of url encoded paramater instead of a body for a form*/

server.listen(3000);

const rooms = { };

/*setting route if there is NO room*/
app.get('/', (req, res) => {
    res.render('index', { rooms: rooms });
    /*send message that new room was created*/
});

app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/');
    }
   rooms[req.body.room] = { users: {} };
   res.redirect(req.body.room);
   // send message when room created
    io.emit('room-created', req.body.room);
});

/*setting route if there IS a room*/
app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/');
    }
    res.render('room', { roomName: req.params.room });
});

io.on('connection', socket => {
    socket.on('new-user', (room, name) => {
        socket.join(room);
        rooms[room].users[socket.id] = name;
        socket.to(room).broadcast.emit('user-connected', name);
    });

    socket.on('send-chat-message', (room, message) => {
        socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] });
    });
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id]);
            delete rooms[room].users[socket.id];
        });
    });
});

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name)
         return names;
    }, []);
}