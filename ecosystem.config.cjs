module.exports = {
  apps: [
    {
      name: "enfyra-app",
      script: ".output/server/index.mjs",
      instances: 1,
      watch: false,
      ignore_watch: ["node_modules", "logs"],
      max_memory_restart: "500M",
      autorestart: true,
      min_uptime: "10s",
      max_restarts: 10,
    },
  ],
};
