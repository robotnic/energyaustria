var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var moment = require('moment');
var $q = require('q');
var fs = require('fs');
var scrapers = require('./scrapers.js');
var installed = require('./scrapers/installed.js');
var dbconnect = JSON.parse(fs.readFileSync('config/dbconnect.json', 'utf8'));
var swaggerTemplate = fs.readFileSync('config/swaggertemplate.json', 'utf8');

var app = express();

console.log(dbconnect);
var XLSX = require('xlsx');


app.use('/', express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post('/day', function(req, res) {
  var day = req.body.DateString;
  var pid = req.body.PID;
  var resolution = req.body.Resolution;
  var reload = req.query.reload;
  scrapers.getChart(day, pid, resolution, reload).then(function(chart) {
    res.send(chart);
  });
});

app.post('/week', function(req, res) {
  var day = req.body.DateString;
  var pid = req.body.PID;
  var resolution = '60M';
  var reload = req.query.reload;
  scrapers.getDays(day, pid, resolution, reload, 7).then(function(response) {
    res.send(response);
  });

})

app.post('/month', function(req, res) {
  var day = req.body.DateString;
  var pid = req.body.PID;
  var resolution = '60M';
  var reload = req.query.reload;
console.log('DAY',day);
  var year = day.substring(0,4);
  var month = day.substr(4,2);
  var daysInMonth = new Date(year, month, 0).getDate();
console.log('DAYinMonth',year, month, daysInMonth);

  scrapers.getDays(day, pid, resolution, reload, daysInMonth).then(function(response) {
    res.send(response);
  });
  var example={"PID":"AL","DateString":"20160601000000","Resolution":"15M","Language":"de","AdditionalFilter":"B19|B16|B01|B04|B05|B06|B09|B10|B11|B12|B15|B17|B20|all"}

})


app.get('/installed/:year', function(req, res) {
  var year = req.params.year;
  console.log(installed);
  installed.load(year).then(function(response){
    res.send(response);
  });
});


app.get('/energy', function(req, res) {
  var day = req.body.DateString;
  var pid = req.body.PID;
  var resolution = '60M';
  var reload = req.query.reload;
  scrapers.getEnergy(day, pid, resolution, reload, 31).then(function(response) {
    res.send(response);
  });


});


app.get('/statistics', function(req, res) {
  scrapers.loadStatistics().then(function(responses) {
    res.send(responses);
  }, function(error) {
    console.log(error);
  });
});


app.get('/hydrostorage', function(req, res) {
  scrapers.loadStorage().then(function(responses) {
    res.send(responses);
  }, function(error) {
    console.log(error);
  });
});


app.get('/sectors', function(req, res) {
  res.send(scrapers.getSectors());
});
app.get('/sectors/:sector', function(req, res) {
  console.log(req.params.sector);
  res.send(scrapers.getSectors(req.params.sector));
});

app.get('/sectors/:sector/:year', function(req, res) {
  res.send(scrapers.getSectors(req.params.sector,req.params.year));
});



/*
//openapi (swagger)
*/

app.get('/openapi', function(req, res) {
  var swagger = JSON.parse(swaggerTemplate);
  app._router.stack.forEach(function(layer){
  if(layer.route){
    var path = layer.route.path;
    var swaggerpath = swaggerize(layer.route.path);
    swagger.paths[swaggerpath] = {};
    for(var m in layer.route.methods){
      var def = {
        parameters:[{
          "in":"query",
          "name":"reload",
          "type":"boolean"
        }]
      }
      if(m === 'post'){
        def.parameters.push( {
          "name": "apg",
          "in": "body",
          "description": "Query APG",
          "schema": {
            "$ref": "#/definitions/apgquery"
          }
        })
      }
      var pathParts = path.split('/');
      pathParts.forEach(function(part){
        if (part[0] === ':') {
          var name = part.substr(1);
          def.parameters.push({
            "name": name,
            "in": "path",
            "required": true,
            "type": "string"
          });
        }
      });
      swagger.paths[swaggerpath][m]=def;
    }
  }
  });
  res.send(swagger);
});

function swaggerize(path){
  // /aaa/:bbb/:ccc -> /aaa/{bbb}/{ccc}
  var parts= path.split('/');
  var newPathParts=[];
  parts.forEach(function(part){
    if(part[0] === ':'){
      var newpart = '{' + part.substr(1) + '}';
    } else {
      var newpart = part;
    }
    newPathParts.push(newpart);
  });
  return newPathParts.join('/');
}

/*
Startup
*/

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});


