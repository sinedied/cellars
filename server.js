var express = require('express');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var properties = require('./package.json')
var app = express();

// Allow CORS
var allowCrossDomain = function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Expose-Headers', '*');
  res.setHeader('Access-Control-Allow-Headers', '*, Content-Type');
  next();
};

app.set('port', (process.env.PORT || 3000));
app.set('trust proxy', true);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(allowCrossDomain);
app.use(helmet());

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
          bottleIndex: index;
        };
    }
  }
  return null;
}

// Emit 404 error
function notFound(res) {
  res.status(404);
  res.type('txt').send('404 not found');
}

// Send a 500 error code to a given response
function invalidRequest(res) {
  res.status(500);
  res.type('txt').send('Invalid request');
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

// GET /
//  Get a simple string
app.get('/', function(req, res) {
  res.type('txt').send(properties.description + ' v' + properties.version);
});

// POST /api/reset
//  Resets the server data
app.post('/api/reset', function(req, res) {
  reset();
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

// POST /api/cellars/:id/bottles
//  Add a new bottle to a cellar id
//  Parameter: { name: 'name', price: 10 }
app.post('/api/cellars/:id/bottles', function(req, res) {
  if (req.body && req.body.cellarId >= 0) {
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
  if (req.body && req.params.id) {
    var result = findBottle(req.params.bottleId);
    if (result && result.cellar.id === req.params.id) {
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
