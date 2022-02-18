"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
//Each player sends a 'message' every time an input is made (completed) - each input is asigned a SQN
//every 1/10th of a second all players poll for all outstanding messages
var Game = /** @class */ (function () {
    function Game(games, data) {
        this.id = -1;
        this.sqn = 0; //Every received message is assigend a sequence number .. for now there is no checking on the order but they *should* be processed in order (by clients)
        this.players = {}; //each game has a set of players, indexed by (unique) player name
        do {
            this.id = Math.floor(Math.random() * 10000) + 1000; //make a random game ID
            this.data = data;
        } while (games.hasOwnProperty(this.id)); //keep looping until we find an unused ID (becuase there's a small chance of a dupe)    
        games[this.id] = this; //store the game we have constructed
    }
    return Game;
}());
var Player = /** @class */ (function () {
    function Player(name) {
        this.q = []; //Outboud queue of messages not yet collected by this player (via a POLL)
        this.name = name;
    }
    return Player;
}());
var Message = /** @class */ (function () {
    function Message() {
    }
    return Message;
}());
exports.Message = Message;
//const createError = require('http-errors');
var express = require('express');
var app = express();
app.get("/", function (req, res) {
    res.send("This service is accessd via POST (don't try and GET from it)");
});
//CORS - without this we cannot accept multipart forms (or do several other things later - this really wants locking down before production)
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*"); //Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Methods', "*"); //; 'POST,GET'); // Add other methods here
    next();
});
app.use(express.json()); //alows us to use req.json
app.options("/*", function (_req, res) { return res.sendStatus(200); }); //we need to respond to preflight- OPTIONS requests for CORS to work
var games = {};
app.post("/*", function (req, res) {
    var msg = req.body; //json() //body
    var game;
    var player;
    if (msg.gameId) {
        game = games[msg.gameId];
    }
    if (msg.cmd == "createGame") {
        game = new Game(games, msg.params);
        console.log("Created game ".concat(game.id));
        res.json({ gameId: game.id });
        res.status(200); //sendStatus(200)
        res.end();
        return;
        //move out (you should join the game you created)
        //player =new Player(msg.name)
        //game.players[msg.name]=player //place them in the games, players object  
        //alter the msg - for output in all the queues
        //msg.cmd="playerJoined" 
        //msg.gameId=game.id
    }
    else if (msg.cmd == "joinGame") {
        //create a new player and add them to the requested game
        player = new Player(msg.name);
        //send the game setup data (whatever that is... in our case, obstacles)
        player.q.push({ gameId: game.id, name: "", cmd: "gameData", sqn: game.sqn, params: game.data });
        game.sqn++;
        //queue a 'virtual' 'playerJoined' message 'from' every player already in the game - for sending to this (joining) player 
        //(so we (the joining players) get to see all the players who have *already* joined)
        for (var pn in game.players) {
            var op = game.players[pn]; //other player      
            player.q.push({ cmd: "playerJoined", name: op.name, gameId: game.id, sqn: game.sqn, params: {} });
            game.sqn++;
        }
        game.players[msg.name] = player;
        msg.cmd = "playerJoined";
        console.log("".concat(msg.name, " joined game ").concat(game.id));
    }
    else if (msg.gameId == null) {
        console.log("ERROR: received a ".concat(msg.cmd || 'null', " command with no gameId present (Only joinGame, and createGame can be called without a gameId"));
    }
    if (msg.cmd != "poll") {
        msg.sqn = game.sqn; //assign a sequence number to the recieved message
        game.sqn++; //increment this *games* SQN (many games can be in progress)
        //relay this message to all connected players (including the sender)
        for (var playerName_1 in game.players) {
            console.log("queuing ".concat(msg, " for ").concat(playerName_1));
            game.players[playerName_1].q.push(msg);
        }
    }
    //the response to posting up ANY message (inclding Poll) is the list of all pending items in YOUR q (which will include the action you just posted)
    if (game.players.hasOwnProperty(msg.name)) {
        //note q *can* be empty if we are polling and there is nothing for us
        if (game.players[msg.name].q.length > 0) {
            res.json(game.players[msg.name].q);
        }
        else {
            res.json({}); //send an empty object if the their queue is empty (sending an empty array casues 'unexpected end of response' clientside)
        }
        game.players[msg.name].q = []; //empty their queue, once it has been sent (note we can't empty 'q'.. that jsut reassigns the object reference and leavers the original unaffected (ask me how i know))
    }
    else {
        console.log("game ".concat(game.id, " has no player '").concat(msg.name, "'"));
    }
    res.status(200); //sendStatus(200)
    res.end();
});
var port = 5050;
app.listen(port, function () { return console.log("started on port ".concat(port)); });
//# sourceMappingURL=server.js.map