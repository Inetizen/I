const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Serve our HTML files

let robots = {}; // Keep track of connected robots

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Identify if the connection is a robot or admin
    socket.on('register-robot', () => {
        robots[socket.id] = { id: socket.id, status: 'Waiting' };
        console.log('Robot Registered:', socket.id);
        io.emit('update-robot-list', robots); // Tell admin a new robot joined
    });

    // Admin asks a specific robot to take a picture
    socket.on('admin-trigger-pic', (robotId) => {
        io.to(robotId).emit('take-picture');
    });

    // Robot sends the picture back to the admin
    socket.on('picture-taken', (data) => {
        io.emit('receive-picture', { robotId: socket.id, imageStr: data.image });
    });

    // Admin sends PASS or FAIL to the robot
    socket.on('send-verdict', (data) => {
        io.to(data.robotId).emit('show-verdict', data.verdict);
    });

    socket.on('disconnect', () => {
        if (robots[socket.id]) {
            delete robots[socket.id];
            io.emit('update-robot-list', robots);
        }
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
