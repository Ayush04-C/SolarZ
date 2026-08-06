const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const User = require('./server/src/models/User');
const Product = require('./server/src/models/Product');

async function checkDb() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const users = await User.find({}).select('name email role');
  console.log('--- USERS ---');
  console.log(users);

  const products = await Product.find({}).select('name seller');
  console.log('\n--- PRODUCTS ---');
  console.log(products);

  mongoose.disconnect();
}

checkDb();
