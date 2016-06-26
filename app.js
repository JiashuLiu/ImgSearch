var express = require('express');
var app = express();
var querystring = require("querystring");
var request=require('request');
var path = require('path');

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/:search', function(req, res,next){
    var searchStr = req.params.search;
    var pagination = req.query.offset || 10;
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

app.listen(app.get('port'),function(){
  console.log('listening to port :'+app.get('port'));
})
