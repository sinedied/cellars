# Cellars

A basic REST API used for training sessions.

## API

Route                                    | Description
-----------------------------------------|------------------------------------
GET    /                                 | Get server info
GET    /api/reset                        | Reset server data
GET    /api/cellars                      | Get the list of existings cellars
POST   /api/cellars                      | Create a new cellar, ex: `{ name: 'name' }`
GET    /api/cellars/:id                  | Get the detail of an existing cellar
DELETE /api/cellars/:id                  | Remove a cellar
POST   /api/cellars/:id/bottles          | Add a new bottle to a cellar, ex: `{ name: 'name', price: 10 }`
DELETE /api/cellars/:id/bottles/:botleId | Remove a bottle
