var socket = io({transports: ['websocket'], upgrade: false});

document.getElementById('join_room').addEventListener('click', (e) => {
  socket.emit('room.join', {
    room: document.getElementById('room').value,
    name: document.getElementById('name').value
  });
  document.querySelector('.headerin').style.display = 'none';
  document.querySelector('.messagebox').style.width = '100%';
  document.querySelector('.headertitle').innerHTML = `Otaq ${document.getElementById('room').value}`;
});

document.getElementById('send_message').addEventListener('click', (e) => {
  socket.emit('event', { 
    room: document.getElementById('room').value,
    name: document.getElementById('name').value,
    message: document.getElementById('message').value
  });
  document.getElementById('message').value = '';
});

var addLi = (e) => {
  if(e.by == 'typing'){ $('.list li.typing').remove(); }
  var li = document.createElement('li');
  li.className = e.by;
  var a = document.createElement('a');
  li.appendChild(a);
  a.appendChild(document.createTextNode(e.message));
  document.getElementById('list').appendChild(li);
  if(e.by != 'typing'){ $('.list li.typing').remove(); }
};

socket.on('event', addLi);

document.getElementById('message').addEventListener('keyup', function(){
  const v = document.getElementById('message').value;
  if(v.trim().length > 0){
    socket.emit('typing', {
      room: document.getElementById('room').value,
      name: document.getElementById('name').value,
      typing: true
    });
  } else {
    socket.emit('typing', {
      room: document.getElementById('room').value,
      name: document.getElementById('name').value,
      typing: false
    });
  }  
});