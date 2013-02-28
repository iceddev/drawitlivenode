require([
  'dojo/dom',
  'dojo/on',
  'wsrpc/client',
  'dojo/domReady!'
], function(dom, on, Rpc){

  var socket = io.connect('/');
  var wsrpc = new Rpc(socket);

  window.wsrpc = wsrpc; //export global just to play with in browser dev tools

  wsrpc.ready(function(){

      on(document,'#wbutton:click',function(){
        var timeStart = Date.now();
        wsrpc.methods.square(dom.byId('num1').value).then(function(result){ showResult(result,timeStart); });
      });

  });



  var showResult = function(result, timeStart){
    dom.byId('result').innerHTML = result;
    dom.byId('elapsedTime').innerHTML = Date.now() - timeStart;
  };

});