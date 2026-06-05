const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { errorHandler } = require('./middlewares/errorHandler');
const { apiRouter } = require('./routes');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRouter);

app.use(errorHandler);

module.exports = app;

