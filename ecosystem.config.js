module.exports = {
  apps: [
    {
      name: 'ubuntu-dev',
      script: 'node',
      args: 'dist/index.js',
      env_dev: {
        NODE_ENV: 'dev',
        ENV_RUN: 'ubuntu'
      },
      env_prod: {
        NODE_ENV: 'prod',
        ENV_RUN: 'ubuntu'
      }
    }
  ]
}
