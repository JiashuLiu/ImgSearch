var express = require('express');
var app = express();
var querystring = require("querystring");
var request=require('request');
var path = require('path');

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/:search', function(req, res,next){
    var searchStr = req.params.search;
    var params = {
    "q": searchStr,
    "count": "10",
    "offset": "0",
    "mkt": "en-us",
    "safeSearch": "Moderate",
};
    var result = querystring.stringify(params);
    var options = {
      url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?'+result,
      headers: {
        "Ocp-Apim-Subscription-Key": '858a1b03660f4557a6e287f9580e9df6'
      },
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        res.send(info.value);
      }
      console.log(response.statusCode);
    };

    request(options, callback);
});

app.listen(app.get('port'),function(){
  console.log('listening to port :'+app.get('port'));
})
