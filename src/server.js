const app = require('./app');
const config = require('./config');
const { sequelize } = require('./models');

const startServer = async () => {
  try {
    // Authenticate database
    await sequelize.authenticate();
    console.log('✓ PostgreSQL connected successfully to', config.db.name);

    const server = app.listen(config.port, () => {
      console.log(`✓ FanTrade Backend server running on http://localhost:${config.port}`);
      console.log(`✓ Environment: ${config.env}`);
      console.log(`✓ Client Origin: ${config.clientUrl}`);
    });

    // Graceful shutdown
    const handleShutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await sequelize.close();
          console.log('PostgreSQL connection closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error closing database:', err);
          process.exit(1);
        }
      });
    };

    process.once('SIGUSR2', () => handleShutdown('SIGUSR2'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
