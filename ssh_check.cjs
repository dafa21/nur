const { execSync, spawn } = require('child_process');
const net = require('net');

// We'll use node's built-in capabilities to run SSH commands
// Using a simple approach with ssh -o options

const HOST = '148.230.98.197';
const USER = 'root';
const PASS = '@Bismillah212';

// Write a PowerShell script that uses SSH with password via expect-like approach
const commands = [
  'cd /var/www/nurhealth 2>/dev/null || cd /var/www 2>/dev/null || cd /root',
  'pwd',
  'ls -la',
  'pm2 list 2>/dev/null || echo "PM2_NOT_FOUND"',
  'node -v 2>/dev/null || echo "NODE_NOT_FOUND"',
  'nginx -t 2>/dev/null | head -5 || echo "NGINX_CHECK_DONE"',
  'cat /etc/nginx/sites-enabled/* 2>/dev/null | grep -A5 "server_name\\|proxy_pass\\|location" | head -50 || echo "NO_NGINX_CONFIG"',
  'ps aux | grep -E "node|pm2|nginx" | grep -v grep',
  'ss -tlnp | grep -E ":80|:443|:3000|:3001"',
].join(' && ');

console.log('Commands to run on VPS:');
console.log(commands);
console.log('\n---');
console.log('SSH command:');
console.log(`ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${USER}@${HOST} "${commands}"`);
