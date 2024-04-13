module.exports = {
  apps: [
    {
      name: 'ubuntu-dev',
      script: 'node',
      args: 'dist/index.js',
      env: {
        NODE_ENV: 'dev'
      }
    }
  ]
}
