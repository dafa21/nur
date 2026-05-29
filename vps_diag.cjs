const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

const HOST = '148.230.98.197';
const USER = 'root';
const PASS = '@Bismillah212';

async function run() {
  console.log(`Connecting to ${USER}@${HOST}...`);
  
  await ssh.connect({
    host: HOST,
    username: USER,
    password: PASS,
    readyTimeout: 20000,
    tryKeyboard: true,
    onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
      console.log('Keyboard interactive prompt:', prompts.map(p => p.prompt));
      finish([PASS]);
    },
    algorithms: {
      kex: [
        'diffie-hellman-group1-sha1',
        'diffie-hellman-group14-sha1',
        'diffie-hellman-group14-sha256',
        'ecdh-sha2-nistp256',
        'ecdh-sha2-nistp384',
        'ecdh-sha2-nistp521',
        'diffie-hellman-group-exchange-sha256',
        'curve25519-sha256',
        'curve25519-sha256@libssh.org',
      ]
    }
  });

  console.log('Connected!\n');

  async function cmd(command) {
    const result = await ssh.execCommand(command);
    console.log(`\n$ ${command}`);
    if (result.stdout) console.log(result.stdout);
    if (result.stderr) console.log('[STDERR]', result.stderr.substring(0, 200));
    return result.stdout;
  }

  await cmd('pwd');
  await cmd('ls /var/www/ 2>/dev/null || echo "No /var/www"');
  await cmd('pm2 list 2>/dev/null || echo "PM2 not found"');
  await cmd('node -v');
  await cmd('ss -tlnp | grep -E ":80|:443|:3000|:3001"');
  await cmd('ps aux | grep -E "node|pm2" | grep -v grep | head -10');
  await cmd('cat /etc/nginx/sites-enabled/* 2>/dev/null | grep -A10 "proxy_pass\\|location /api" | head -40 || echo "No nginx proxy config found"');
  await cmd('ls /var/www/nurhealth/ 2>/dev/null || echo "nurhealth folder not found"');

  ssh.dispose();
  console.log('\nDone!');
}

run().catch(e => {
  console.error('SSH Error:', e.message);
  process.exit(1);
});
