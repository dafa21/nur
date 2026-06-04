module.exports = {
  apps: [
    {
      name: 'nurhealth-main',
      // Gunakan file JS yang sudah di-compile (bukan tsx runtime compiler!)
      // 'npx tsx' = TypeScript compiler jalan terus → CPU 100%
      // 'node dist/server.cjs' = binary JS biasa → CPU normal
      script: 'node',
      args: 'dist/server.cjs',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '400M',  // restart otomatis jika RAM > 400MB
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Jangan restart terlalu cepat jika crash (backoff mencegah CPU spike loop)
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 3000,
    }
  ]
};
