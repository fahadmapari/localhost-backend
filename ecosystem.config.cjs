module.exports = {
  apps: [
    {
      name: "localhost-backend",
      script: "dist/app.js", // or app.js
      instances: "max", // run workers = CPU cores
      exec_mode: "cluster", // enables zero-downtime reloads
      autorestart: true,
      max_memory_restart: "300M",
      watch: false,
    },
  ],
};
