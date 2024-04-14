module.exports = {
  apps: [
    {
      name: 'ubuntu-dev',
      script: 'node',
      args: 'dist/index.js',
      env_dev: {
        NODE_ENV: 'dev'
      },
      env_prod: {
        NODE_ENV: 'prod'
      }
    }
  ]
}
