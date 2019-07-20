module.exports = {
  apps: [
    {
      name: 'my website',
      script: './app.js',
      instances: 0,
      exec_mode: 'cluster',
      watch: true,
      env: {
        NODE_ENV: 'production',
        PORT: '3000'
      }
    }
  ]
};
