var express = require("express"),
      app = express();

app.use(express.static(__dirname + "/"));

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(404).send('Page Not Found');
  res.status(500).send('Something is broken');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.listen(3000);
console.log("Server running on port 3000");