const { retry } = require("rxjs");

module.exports = {
  apps: [
    {
      name: 'travel-booking-app',
      script: 'dist/main.js',
      instances: 4,
      exec_mode: 'cluster', // use "fork" | "cluster" for multi-core
      instance_var: 'INSTANCE_ID',
      watch: false,
      retry: true,
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
