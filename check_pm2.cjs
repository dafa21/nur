const { NodeSSH } = require('node-ssh');

// More password variations - including without backslash, with double quotes, etc.
const passwords = [
  '@Bismillah212',
  'Bismillah212',
  '@Bismillah212!',
  '@bismillah212',
  ' "@Bismillah212\\',
  '"@Bismillah212\\',
  '@Bismillah212\\\\',
  '\\@Bismillah212\\',
  '@Bismillah212 ',
  'Bismillah212\\',
];

async function tryConnect(password, index) {
  const ssh = new NodeSSH();
  try {
    await ssh.connect({
      host: '148.230.98.197',
      username: 'root',
      password: password,
      port: 22,
      tryKeyboard: true,
      readyTimeout: 8000,
    });
    console.log(`\n✅ Password #${index + 1} WORKS!`);
    
    // Immediately get PM2 status
    console.log('\n📋 PM2 Status:');
    const status = await ssh.execCommand('pm2 status');
    console.log(status.stdout || status.stderr);
    
    console.log('\n📜 PM2 Logs sim-nurhealth (last 30 lines):');
    const logs = await ssh.execCommand('pm2 logs sim-nurhealth --lines 30 --nostream');
    console.log(logs.stdout);
    if (logs.stderr) console.log(logs.stderr);
    
    console.log('\n🔍 Port 30004:');
    const portCheck = await ssh.execCommand('ss -tlnp | grep 30004 || echo "Port 30004 NOT listening"');
    console.log(portCheck.stdout);

    console.log('\n📁 Directory contents:');
    const ls = await ssh.execCommand('ls -la /var/www/sim-nurhealth/ 2>/dev/null || echo "Directory not found"');
    console.log(ls.stdout);

    ssh.dispose();
    return true;
  } catch (e) {
    console.log(`❌ #${index + 1} "${password}" -> ${e.message.substring(0, 50)}`);
    ssh.dispose();
    return false;
  }
}

async function main() {
  console.log('🔌 Trying more password variations...\n');
  for (let i = 0; i < passwords.length; i++) {
    const success = await tryConnect(passwords[i], i);
    if (success) return;
  }
  console.log('\n⚠️ All passwords failed. Please provide the correct VPS password.');
}

main();
