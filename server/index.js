require('dotenv').config()

const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  destroyReservation
} = require('./db')
const express = require('express')
const app = express()
app.use(express.json())


// GET routes
app.get('/api/customers',  async(req, res, next)=> {
  try {
    res.send(await fetchCustomers())
  }
  catch(error){
    next(error);
  }
})

app.get('/api/places',  async(req, res, next)=> {
  try {
    res.send(await fetchRestaurants());
  }
  catch(error){
    next(error)
  }
});

app.get('/api/reservations',  async(req, res, next)=> {
  try {
    res.send(await fetchReservations())
  }
  catch(error){
    next(error)
  }
});

// DELETE routes
app.delete('/api/customers/:customer_id/reservations/:id',  async(req, res, next)=> {
  try {
    await destroyReservation({customer_id: req.params.customer_id, id: req.params.id});
    res.sendStatus(204);
  }
  catch(error){
    next(error);
  }
});

// POST routes
app.post('/api/customers/:customer_id/reservations',  async(req, res, next)=> {
  try {
    res.status(201).send(await createReservation({ customer_id: req.params.customer_id, restaurant_id: req.body.place_id, departure_date: req.body.departure_date}));
  }
  catch(error){
    next(error);
  }
});

app.use((err, req, res, next)=> {
  res.status(err.status || 500).send({ error: err.message || err});
});

// init function
const init = async () => {
  await client.connect()
  console.log('db connected')
  await createTables()
  console.log('tables created')
  const [moe, lucy, larry, ethyl, mcdonalds, wendys, dennys] = await Promise.all([
    createCustomer({ name: 'moe'}),
    createCustomer({ name: 'lucy'}),
    createCustomer({ name: 'larry'}),
    createCustomer({ name: 'ethyl'}),
    createRestaurant({ name: 'mcdonalds'}),
    createRestaurant({ name: 'wendys'}),
    createRestaurant({ name: 'dennys'}),
  ])
  console.log(await fetchCustomers())
  console.log(await fetchRestaurants())

  const [reservation, reservation2] = await Promise.all([
    createReservation({
      customer_id: moe.id,
      restaurant_id: dennys.id,
      date: '04/07/2024',
      party_count: 4
    }),
    createReservation({
      customer_id: larry.id,
      restaurant_id: dennys.id,
      date: '04/01/2024',
      party_count: 5
    }),
  ])
  console.log(await fetchReservations())

  await destroyReservation({ id: reservation.id, customer_id: reservation.customer_id})
  console.log(await fetchReservations())
}

// Listener
const port = process.env.PORT || 3000
app.listen(port, ()=> {
  console.log(`listening on port ${port}`)
})

init()