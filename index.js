const express = require('express'),
  socketio = require('socket.io'),
  process = require('process'),
  config = require('./config.js'),
  socketioRedis = require('socket.io-redis');

var app = express();
var server = app.listen(config.port, () => { console.log(`Server is ${config.port}`) });
var io = socketio(server);

app.use(express.static('public'));

io.adapter(socketioRedis({host: config.redis_host, port: config.redis_port}));

var allClients = [];
io.on('connection', (socket) => {
  allClients.push(socket);

  socket.on('room.join', (e) => {
    allClients["name"] = e.name;
    allClients["room"] = e.room;
    Object.keys(socket.rooms).filter((r) => r != socket.id)
    .forEach((r) => socket.leave(r));

    setTimeout(() => {
      socket.join(e.room);
      socket.emit('event', {
        by: 'info',
        message: 'Xoş gəldiniz.'
      });
      socket.broadcast.to(e.room).emit('event', {
        by: 'info',
        message: e.name + ' daxil oldu.'
      });
    }, 0);
  })

  socket.on('event', (e) => {
    socket.emit('event', {
      by: 'me',
      message: `${e.name} : ${e.message}`
    });
    socket.broadcast.to(e.room).emit('event', {
      by: 'other',
      message: `${e.message} : ${e.name}`
    });
  });

  socket.on('typing', (e) => {
    if(e.typing){
      socket.broadcast.to(e.room).emit('event', {
        by: 'typing',
        message: e.name + ' yazir...'
      });
    } else {
      socket.broadcast.to(e.room).emit('event', {
        by: 'stop_typing',
        message: ''
      });
    }
  })

  socket.on('disconnect', function() {
      socket.broadcast.to(allClients["room"]).emit('event', {
        by: 'info',
        message: allClients["name"] + ' otaqdan çıxdı.'
      });
      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
  });

});
