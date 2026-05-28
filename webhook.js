const http = require('http');
const { exec } = require('child_process');

const PORT = 9000;

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    console.log('Webhook received from GitHub!');
    
    const deployCommand = 'cd /var/www/nurhealth && git pull origin main && npm install && npm run build && pm2 restart nurhealth-main';
    
    exec(deployCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error during deployment: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Deployment stderr: ${stderr}`);
      }
      console.log(`Deployment stdout: ${stdout}`);
      console.log('App successfully updated and restarted!');
    });

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Deployment triggered automatically\n');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found\n');
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Webhook listener running on port ${PORT}`);
});
