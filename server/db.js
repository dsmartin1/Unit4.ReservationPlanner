const pg = require('pg')

const client = new pg.Client(process.env.DATABASE_URL || `postgres://localhost/${process.env.DB_NAME}`)

const uuid = require('uuid')

// seeding tables
const createTables = async () => {
  const SQL = /*SQL*/ `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS restaurants;

    CREATE TABLE customers (
      id UUID PRIMARY KEY,
      name VARCHAR(100)
    );
    CREATE TABLE restaurants (
      id UUID PRIMARY KEY,
      name VARCHAR(100)
    );
    CREATE TABLE reservations (
      id UUID PRIMARY KEY,
      date DATE NOT NULL,
      party_count INTEGER NOT NULL,
      customer_id UUID REFERENCES customers(id) NOT NULL,
      restaurant_id UUID REFERENCES restaurants(id) NOT NULL
    );
  `
  await client.query(SQL)
}

// POST functions
const createCustomer = async ({ name }) => {
  const SQL = /*SQL*/`
    INSERT INTO customers(id, name) VALUES($1, $2) RETURNING *;
  `
  const response = await client.query(SQL, [uuid.v4(), name])
  return response.rows[0]
}

const createRestaurant = async(name)=> {
  const SQL = /*SQL*/`
    INSERT INTO restaurants(id, name) VALUES($1, $2) RETURNING *;
  `
  const response = await client.query(SQL, [uuid.v4(), name])
  return response.rows[0];
}

const createReservation = async({ restaurant_id, customer_id, date, party_count})=> {
  const SQL = /*SQL*/`
    INSERT INTO reservations(id, restaurant_id, customer_id, date, party_count) VALUES($1, $2, $3, $4, $5) RETURNING *;
  `
  const response = await client.query(SQL, [uuid.v4(), restaurant_id, customer_id, date, party_count])
  return response.rows[0]
}

// GET functions
const fetchCustomers = async()=> {
  const SQL = /*SQL*/`
    SELECT *
    FROM customers;
  `
  const response = await client.query(SQL)
  return response.rows
};

const fetchRestaurants = async()=> {
  const SQL = /*SQL*/`
    SELECT *
    FROM restaurants;
  `
  const response = await client.query(SQL)
  return response.rows
};

const fetchReservations = async()=> {
  const SQL = /*SQL*/`
    SELECT *
    FROM reservations;
  `
  const response = await client.query(SQL)
  return response.rows
}

// DELETE functions
const destroyReservation = async({ id, customer_id }) => { 
  // Note: Needs customer_id to ensure customer can only destroy own reservations.
  // In a real app, this might use an auth token instead.
  console.log(id, customer_id)
  const SQL = /*SQL*/`
    DELETE FROM reservations
    WHERE id = $1 AND customer_id=$2;
  `;
  await client.query(SQL, [id, customer_id])
}

// export
module.exports = {
  client,
  createTables,
  createCustomer,
  createReservation,
  createRestaurant,
  fetchRestaurants,
  fetchCustomers,
  fetchReservations,
  destroyReservation
}