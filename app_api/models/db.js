const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost/Loc8r';
const readLine = require('readline');

const connect = () => {
  setTimeout(() => mongoose.connect(dbURI), 1000);
}

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', err => {
  console.log('error: ' + err);
  return connect();
});

mongoose.connection.on('disconnected', () => {
  console.log('disconnected');
});

if (process.platform === 'win32') {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on ('SIGINT', () => {
    process.emit("SIGINT");
  });
}

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close()
      .then(() => {
          console.log(`Mongoose disconnected through ${msg}`);
          callback();
      })
      .catch((err) => {
          console.error('Error closing Mongoose connection:', err);
          callback(err); // 오류가 발생하면 콜백에 에러 전달
      });
}

process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});
process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});
process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});

connect();

require('./locations');