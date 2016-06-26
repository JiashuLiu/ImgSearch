var express = require('express');
var app = express();
var querystring = require("querystring");
var request=require('request');
var path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/searchlogs');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected");
});
var logSchema = new mongoose.Schema({
term : { type: String },
date: {type: Date, default: Date.now}
});
var searchlog = mongoose.model('searchlog', logSchema);

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/:search', function(req, res,next){
    var searchStr = req.params.search;
    var pagination = req.query.offset || 10;
    if(searchStr!=="favicon.ico"){
      var newlog = new searchlog({term:searchStr,date:new Date().toLocaleString()});
      newlog.save(function (err) {
        if (err) console.log(err);
      })
    };
    var params = {
    "q": searchStr,
    "count": "10",
    "offset": pagination,
    "mkt": "en-us",
    "safeSearch": "Moderate",
};
    var result = querystring.stringify(params);
    var options = {
      url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?'+result,
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.API_KEY
      },
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        var group=info.value;
        var endResult=[];
        group.forEach(function(item) {
               var set={};
               set["url"] = item["contentUrl"];
               set["snippet"] = item["name"];
               set["thumbnail"] = item["thumbnailUrl"];
               set["context"] ="https://"+item["hostPageDisplayUrl"];
               endResult.push(set);
        });
        res.send(endResult);
      }
      console.log(response.statusCode);
    };

    request(options, callback);
});
app.get("/api/recent",function(req,res){
  searchlog.find({},{ '_id': 0, '__v':0}).sort('-date').limit(10).exec(function(err, posts){
    console.log("Emitting Update...");
    console.log("Update Emmited");
    res.send(posts);
});
});

app.listen(app.get('port'),function(){
  console.log('listening to port :'+app.get('port'));
})
