require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');

let isDbConnected = false;

module.exports = async (req, res) => {
  if (!isDbConnected) {
    await connectDB();
    isDbConnected = true;
  }

  return app(req, res);
};
