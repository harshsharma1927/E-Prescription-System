const app = require('./app');
const { env } = require('./config/env');
const { connectDB } = require('./config/db');

async function start() {
  await connectDB();
  app.listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${process.env.PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});

