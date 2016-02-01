# Cellars

A basic REST API used for training sessions.

## API

Route                                    | Description
-----------------------------------------|------------------------------------
GET /api/cellars                         | Get the list of existings cellars
GET /api/cellars/:id                     | Get the detail of an existing cellar id
POST /api/cellars                        | Create a new cellar, Parameter: { name: 'name' }
POST /api/cellars/:id/bottles            | Add a new bottle to a cellar id, Parameter: { name: 'name', price: 10 }
DELETE /api/cellars/:id/bottles/:botleId | Remove a bottle
