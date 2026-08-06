const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const User = require('./server/src/models/User');
const Product = require('./server/src/models/Product');

async function checkDb() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const products = await Product.find({}).select('name stock price');
  console.log('\n--- PRODUCTS ---');
  console.log(products);

  const users = await User.find({}).select('name cart');
  console.log('\n--- USERS CART ---');
  console.log(JSON.stringify(users, null, 2));

  mongoose.disconnect();
}

checkDb();
