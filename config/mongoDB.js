const { MongoClient } = require("mongodb");

const DB = "users";
const client = new MongoClient(process.env.DB_URI);

async function connectToDb() {
  await client.connect();
  const db = client.db(DB);
  return db;
}

module.exports = connectToDb;
