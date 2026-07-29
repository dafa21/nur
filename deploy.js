import { NodeSSH } from 'node-ssh';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const ssh = new NodeSSH();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deploy() {
  const host = '148.230.98.197';
  const username = 'root';
  const password = process.env.VPS_PASSWORD;

  if (!password) {
    console.error('❌ ERROR: VPS_PASSWORD belum diatur di file .env lokal Anda!');
    console.error('Silakan buka file .env dan tambahkan baris: VPS_PASSWORD="password_root_vps_anda"');
    process.exit(1);
  }

  console.log(`🚀 Memulai deployment langsung dari laptop ke VPS (${host})...`);

  try {
    console.log('1️⃣ Mencoba terhubung ke VPS via SSH...');
    await ssh.connect({
      host: host,
      username: username,
      password: password,
      port: 22,
      tryKeyboard: true,
    });
    console.log('✅ Berhasil masuk ke VPS!');

    const remoteDir = '/var/www/nurhealth';
    console.log(`2️⃣ Memastikan folder ${remoteDir} ada...`);
    await ssh.execCommand(`mkdir -p ${remoteDir}`);

    console.log('3️⃣ Mengunggah file dist, package.json, dan ecosystem.config.cjs...');
    await ssh.putDirectory(path.join(__dirname, 'dist'), path.join(remoteDir, 'dist'), {
      recursive: true,
      concurrency: 10,
    });
    
    await ssh.putFiles([
      { local: path.join(__dirname, 'package.json'), remote: path.join(remoteDir, 'package.json') },
      { local: path.join(__dirname, 'ecosystem.config.cjs'), remote: path.join(remoteDir, 'ecosystem.config.cjs') },
    ]);
    console.log('✅ File berhasil diunggah!');

    console.log('4️⃣ Menginstall dependencies di VPS dan merestart PM2...');
    const result = await ssh.execCommand(
      'npm install --production && export NODE_ENV=production && pm2 start ecosystem.config.cjs && pm2 save',
      { cwd: remoteDir }
    );
    
    console.log('Output Instalasi & PM2:');
    console.log(result.stdout);
    if (result.stderr) {
      console.log('Peringatan dari PM2/NPM:');
      console.log(result.stderr);
    }

    console.log('🎉 DEPLOYMENT SUKSES!');
    
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat deploy:');
    console.error(error.message);
    if (error.message.includes('authenticate')) {
      console.error('\n--> KEMUNGKINAN BESAR PASSWORD VPS ANDA SALAH. Pastikan VPS_PASSWORD di .env sudah benar!');
    }
  } finally {
    ssh.dispose();
  }
}

deploy();
