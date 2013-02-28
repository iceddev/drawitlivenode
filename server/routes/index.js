define([
  //any depedencies go here
], function(){
  return {
    index: function(req, res){
      res.render('index', { title: 'Express' });
    }
  };
});