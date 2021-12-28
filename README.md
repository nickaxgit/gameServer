# gameServer
A generic server for multiplayer online games, written in Typescript/Node.js

See the index.html for examples of creating and joining a game

To install, clone the repository in the normal way then ...
In the vscode terminal window (in the right folder!)
Install the dependencies by typing "npm install" 
Install the nodeJs 'typings' with ... "npm install @types/node --save-dev"
Install Express.js (webserver/framework) .. "npm install express"
Compile the TypeScript with "tsc"
Start the server with "node server.js"  (NOTE .JS)
You should now have the server running (Saying "Started on port 5050")

Then launch 'index.html' by right clicking it, and choosing 'open with live server'

On the index page you can create a game, by entering a player name and pressing 'create a game'

You can connect another client by copying the URL into another browser tab, and then joining the Game

Pressing 'Run to' on *either* instance, should make the commands appear in both instances

You will need to write your own implementation of processMessages .. which will perform the game actions based on the items in the message queue (you should NOT directly respond to the control inputs, they will be 'bounced' off the server instead now)

