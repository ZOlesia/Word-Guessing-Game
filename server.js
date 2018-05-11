const express = require('express');
const app = express();
const path = require('path');

var bodyParser = require('body-parser');
var session = require('express-session');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "./static")));
app.set('views', path.join(__dirname + "/views"));
app.use(session({
    secret: 'somesuperdupersecret',
    resave: true,
    saveUninitialized: true
}))
app.set('view engine', 'ejs');

const server = app.listen(8000);
const io = require('socket.io')(server);
// var currentUser = "";
var messages = [];
var broadcast_word = "";
var broadcast_theme ="";
var broadcast_answer = "";
io.on('connection', function (socket) { //2
    console.log(io.engine.clientsCount);
    //io.engine.clientsCount == 1
    socket.on('got_a_new_user', function (data) {
        if ( broadcast_word === "") {
            socket.emit('game_creator', data);
        }
        socket.broadcast.emit('new_user_join', data);
    })

    socket.on('got_a_new_word', function (data) {
        console.log(data);
        io.emit('new_word_created', data);
        broadcast_word = data;
    })

    io.emit('broadcast_word', broadcast_word);

    socket.on('got_a_new_theme', function (theme) {
        console.log(theme);
        io.emit('new_theme_created', theme);
        broadcast_theme = theme;
    })

    io.emit('broadcast_theme', broadcast_theme);


    socket.on('message', function (user, message) {
        var line = user + ": " + message[0].value;
        console.log(line);
        messages.push(line);
        io.emit('broad', messages);
    })

    socket.on('correct_answer', function(data,user)
    {
        var message = user + ' got it right: ' + data;
        // messages.push(message);
        io.emit('correct_answer', message);
    })

    socket.on('incorrect_answer', function(data,user)
    {
        var message = user + ' got it wrong: ' + data;
        messages.push(message);
        io.emit('incorrect_answer', messages);
    })

});

app.get('/', function (req, res) {
    res.render('index');
});


