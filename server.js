var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var compression = require('compression');
var properties = require('./package.json')

var app = express();
app.set('port', (process.env.PORT || 3000));

app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Internal stuff
// ---------------------------------------------------------------------------

// Constants
var DEFAULT_CELLAR = {
  id: 0,
  name: "Jeremy's cellar",
  bottles: [
    { id: 0, name: "Saint Emilion", price: 12.89 }
  ]
};

// Storage
var bottleId, cellarId, cellars;

// Reset data
function reset() {
  bottleId = 1;
  cellarId = 1;
  cellars = [ DEFAULT_CELLAR ];
}

// Get the index of a cellar from its ID
function getCellarIndex(id) {
  id = parseInt(id);
  for (var i = 0; i < cellars.length; i++) {
    if (cellars[i].id === id) {
      return i;
    }
  }
  return -1;
}

// Get a cellar from its ID
function getCellar(id) {
  var index = getCellarIndex(id);
  if (index >= 0) {
    return cellars[index];
  }
  return null;
}

// Get the index of a bottle in a cellar from its ID
function getBottleIndex(cellar, id) {
  id = parseInt(id);
  for (var i = 0; i < cellar.bottles.length; i++) {
    if (cellar.bottles[i].id === id) {
      return i;
    }
  }
  return -1;
}

// Get a bottle from its ID
function findBottle(id) {
  id = parseInt(id);
  for (var i = 0; i < cellars.length; i++) {
    var index = getBottleIndex(cellars[i], id);
    if (index >= 0) {
        return {
          cellar: cellars[i],
          bottleIndex: index
        };
    }
  }
  return null;
}

// Send a 404 error
function notFound(res) {
  res.status(404);
  res.type('txt').send('404 not found');
}

// Send a 500 error
function invalidRequest(res) {
  res.status(500);
  res.type('txt').send('Invalid request');
}

// Send an OK response
function responseOk(res) {
  res.json({ success: true });
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

// GET /
//  Get a simple string
app.get('/', function(req, res) {
  res.type('txt').send(properties.description + ' v' + properties.version);
});

// GET /api/reset
//  Resets the server data
app.post('/api/reset', function(req, res) {
  reset();
  responseOk(res);
});

// GET /api/cellars
//  Get the list of existings cellars
app.get('/api/cellars', function(req, res) {
  var result = [];
  for (var i = 0; i < cellars.length; i++) {
    result[i] = { id: cellars[i].id, name: cellars[i].name };
  }
  res.jsonp(result);
});

// GET /api/cellars/:id
//  Get the detail of an existing cellar id
app.get('/api/cellars/:id', function(req, res) {
  var cellar = getCellar(req.params.id);
  if (cellar) {
    res.jsonp(cellar);
  } else {
    notFound(res);
  }
});

// DELETE /api/cellars/:id
//  Remove a cellar
app.delete('/api/cellars/:id', function(req, res) {
  var index = getCellarIndex(req.params.id);
  if (index >= 0) {
    cellars.splice(index, 1);
    responseOk(res);
  } else {
    invalidRequest(res);
  }
});

// POST /api/cellars
//  Create a new cellar
//  Parameter: { name: 'name' }
app.post('/api/cellars', function(req, res) {
  if (req.body && req.body.name) {
    var cellar = { id: cellarId++, name: req.body.name, bottles: [] };
    cellars.push(cellar);
    res.json(cellar);
  } else {
    invalidRequest(res);
  }
});

// GET /api/cellars/:id/bottles
//  Get the bottles of an existing cellar id
app.get('/api/cellars/:id/bottles', function(req, res) {
  var cellar = getCellar(req.params.id);
  if (cellar) {
    res.jsonp(cellar.bottles);
  } else {
    notFound(res);
  }
});

// POST /api/cellars/:id/bottles
//  Add a new bottle to a cellar id
//  Parameter: { name: 'name', price: 10 }
app.post('/api/cellars/:id/bottles', function(req, res) {
  if (req.body && req.params.id >= 0) {
    var cellar = getCellar(req.params.id);
    if (cellar && req.body.name && req.body.price) {
      var bottle = { id: bottleId++, name: req.body.name, price: req.body.price };
      cellar.bottles.push(bottle);
      res.json(bottle);
      return;
    }
  }
  invalidRequest(res);
});

// DELETE /api/cellars/:id/bottles/:botleId
//  Remove a bottle
app.delete('/api/cellars/:id/bottles/:bottleId', function(req, res) {
  if (req.body && req.params.id && req.params.bottleId) {
    var result = findBottle(req.params.bottleId);
    if (result) {
      var cellar = result.cellar;
      cellar.bottles.splice(result.bottleIndex, 1);
      res.json(cellar);
      return;
    }
  }
  invalidRequest(res);
});

// Start server
reset();
app.listen(app.get('port'), function() {
  console.log('Listening on port ' + app.get('port'));
});
