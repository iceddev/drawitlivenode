define([
  // Require in modules here
  'dojo/_base/config',
  'dojo/node!ecstatic',
  'dojo/node!http',
  'dojo/node!path',
  'dojo/node!socket.io',
  'wsrpc'
], function(config, ecstatic, http, path, socketio, wsrpc){

  var server = http.createServer(ecstatic({
    root: config.baseUrl + '/public',
    autoIndex: true
  }));
  var io = socketio.listen(server);

  var whiteboards = {};
  var maxAlive = 1000 * 60 * 60 * 24; // one day

  //define some rpc functions
  wsrpc.functions = {
    getWhiteBoard: function(id, userName){
      try{
        //console.log('getWhiteBoard',id,userName);
        purgeWhiteboards();
        var wb = whiteboards[id];
        if(!wb){
          wb = {messages:[],users:[], time: Date.now()};
          whiteboards[id] = wb;
        }else{
          wb.time = Date.now();
        }

        this.socket.join(id);

        userName = cleanString(userName);
        var hasUser = false;
        for (var i = 0; i < wb.users.length; i++) {
          if(wb.users[i] == userName){
            hasUser = true;
          }
        }
        if(!hasUser){
          wb.users.push(userName);
        }

        this.socket.broadcast.to(id).emit('users',whiteboards[id].users);
        this.respond(whiteboards[id]);
      }catch(e){
        this.error(e);
      }
    },
    getUsers: function(id){
      var wb =whiteboards[id];
      if(wb){
        wb.time = Date.now();
        this.respond(whiteboards[id].users);
      }
    },
    sendMessage: function(id, message, userName){
        message.fromUser = userName;

        //TODO format message text

        var wb =whiteboards[id];
        if(wb){
          wb.time = Date.now();
          if(message.chatMessage){
            message.chatMessage = cleanString(message.chatMessage);
          }
          wb.messages.push(message);

          this.socket.broadcast.to(id).emit('message',message);
          this.respond({status:'ok',message: message});
        }

    }
  };

  function purgeWhiteboards(){
    for(var id in whiteboards){
      var wb = whiteboards[id];
      if(wb){
        if((Date.now() - wb.time) > maxAlive){
          delete whiteboards.id;
        }
      }
    }
  }

  function cleanString(str){
    if(str){
      str = String(str);
      str = str.replace(/</g,'{').replace(/>/g,'}');
      return str;
    }
  }

  //lisent on socket.io for incoming rpc requests
  wsrpc.listen(io);

  server.listen(3003, function(){
    console.log("Express server listening on port " + 3003);
  });

});