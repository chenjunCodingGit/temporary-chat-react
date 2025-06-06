const express = require('express');
const axios = require('axios');
const createError = require('http-errors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.get('/', async (req, res, next) => {
  res.send({ message: 'Awesome it works 🐻' });
});

app.use('/api', require('./routes/api.route'));

app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

const testConnectivity = async () => {
  try {
    const response = await axios.get('https://oauth2.googleapis.com', {
      timeout: 5000
    });
    console.log('Connectivity test success:', response.status);
  } catch (err) {
    console.error('Connectivity test failed:', err.message);
  }
};

testConnectivity().then(() => {
  console.log('Google API is reachable.');
}).catch(err => {
  console.error('Error during connectivity test:', err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
