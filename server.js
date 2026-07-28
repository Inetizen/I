const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');

// Firebase Initialization
const serviceAccount = require('./firebase-key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let robots = {}; 

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('register-robot', () => {
        robots[socket.id] = { id: socket.id, status: 'Active' };
        console.log('Robot Registered:', socket.id);
        io.emit('update-robot-list', robots); 
    });

    // Admin can still manually trigger if needed
    socket.on('admin-trigger-pic', (robotId) => {
        io.to(robotId).emit('take-picture');
    });

    // 🚀 NEW: Receive AUTO-CAPTURED picture and save it immediately
    socket.on('auto-picture-taken', async (data) => {
        try {
            // Save directly to Firebase Database
            await db.collection('inspections').add({
                robotId: socket.id,
                verdict: 'AUTO_SAVED', // Status mark
                imageBase64: data.image,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Auto-Saved picture to Firebase for robot ${socket.id}`);
        } catch (error) {
            console.error("❌ Error saving auto-picture to Firebase:", error);
        }

        // Also send it to Admin dashboard so they can see the live feed
        io.emit('receive-picture', { robotId: socket.id, imageStr: data.image });
    });

    socket.on('send-verdict', async (data) => {
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
