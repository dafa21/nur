module.exports = {
  apps: [
    {
      name: 'nurhealth-main',
      script: 'npx',
      args: '-y tsx server.ts',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyCKT2q9-rUictxv3_b7_I3Lxt74YGCUNsM'
      }
    }
  ]
};
