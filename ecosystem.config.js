// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'travel-booking-app',
      script: 'dist/src/server.js',
      instances: 3,
      exec_mode: 'cluster', // use "fork" | "cluster" for multi-core
      instance_var: 'INSTANCE_ID',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
