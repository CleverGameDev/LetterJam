const express = require('express')
const http = require('http')
const path = require('path')
const geckos = require('@geckos.io/server').default

const app = express()
const server = http.createServer(app)

const port = process.env.PORT || 3000;

const io = geckos();

let players = [];
let playerId = 0;

// Web logic
app.use('/', express.static(path.join(__dirname, '../../dist')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'))
})

app.get('/port', (req, res) => {
  res.send({port})
})

io.addServer(server);

let scenes = [
	'LobbyScene',
	'SetupScene',
	'GameScene',
	'EndScene',
];

let sceneIndex = 0;

io.onConnection((channel) => {
	channel.join('sampleRoom')
	playerId += 1;
	channel.playerId = playerId;
	players.push(channel.playerId);

  channel.onDisconnect(() => {
		players.splice(players.indexOf(channel.playerId), 1);
	  channel.room.emit('playerLeft', {
	  	playerId: channel.playerId,
	  });
  })

  channel.on('nextScene', () => {
  	sceneIndex++;
  	sceneIndex %= scenes.length;

    channel.room.emit('update', {
    	scene: scenes[sceneIndex],
    });
  });

  channel.emit('ready', {
  	id: playerId,
  	scene: scenes[sceneIndex],
  	players,
  });

  channel.room.emit('playerJoined', {
  	playerId,
  });
})

server.listen(port, () => {
  console.log('Express is listening on http://localhost:' + port)
})