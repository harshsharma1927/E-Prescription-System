const dns = require('dns');
const mongoose = require('mongoose');
const { env } = require('./env');

// Some routers/DNS setups refuse SRV queries from Node (querySrv ECONNREFUSED)
// while mongodb+srv:// URIs require them. Public resolvers avoid that on Windows/local dev.
function configureDnsForMongoSrv(uri) {
  if (!uri?.startsWith('mongodb+srv://')) return;
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}

function maskMongoUri(uri) {
  if (!uri) return '(not set)';
  return uri.replace(/:([^:@/]+)@/, ':****@');
}

function getMongoConnectionOptions() {
  return {
    autoIndex: env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    connectTimeoutMS: 10_000,
    heartbeatFrequencyMS: 10_000,
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30_000,
    retryWrites: true,
    // Prefer IPv4 in AWS VPC/ECS when IPv6 routing is unavailable.
    family: 4,
  };
}

function registerConnectionEventLogs() {
  const { connection } = mongoose;

  connection.on('connected', () => {
    // eslint-disable-next-line no-console
    console.log('[MongoDB] Connection event: connected', {
      host: connection.host,
      name: connection.name,
    });
  });

  connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[MongoDB] Connection event: error', {
      name: err?.name,
      message: err?.message,
      code: err?.code,
    });
  });

  connection.on('disconnected', () => {
    // eslint-disable-next-line no-console
    console.warn('[MongoDB] Connection event: disconnected');
  });
}

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    // eslint-disable-next-line no-console
    console.error(
      '[MongoDB] Connection aborted: MONGO_URI is not set. Configure it in ECS task env, Secrets Manager, or backend/.env.'
    );
    throw new Error('MONGO_URI is required');
  }

  configureDnsForMongoSrv(mongoUri);
  registerConnectionEventLogs();

  const options = getMongoConnectionOptions();

  try {
    // eslint-disable-next-line no-console
    console.log('[MongoDB] Connecting to Atlas...', {
      uri: maskMongoUri(mongoUri),
      serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
    });

    await mongoose.connect(mongoUri, options);

    // eslint-disable-next-line no-console
    console.log('[MongoDB] Connected successfully.', {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[MongoDB] Failed to connect to Atlas.');
    // eslint-disable-next-line no-console
    console.error('[MongoDB] URI (masked):', maskMongoUri(mongoUri));
    // eslint-disable-next-line no-console
    console.error('[MongoDB] Error name:', err?.name || 'UnknownError');
    // eslint-disable-next-line no-console
    console.error('[MongoDB] Error message:', err?.message || String(err));
    if (err?.code) {
      // eslint-disable-next-line no-console
      console.error('[MongoDB] Error code:', err.code);
    }
    if (err?.reason) {
      // eslint-disable-next-line no-console
      console.error('[MongoDB] Error reason:', err.reason);
    }
    if (err?.stack && env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[MongoDB] Stack trace:', err.stack);
    }

    throw err;
  }
}

module.exports = { connectDB };
