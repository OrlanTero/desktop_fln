const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the scripts directory exists
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Start the PHP API server
const apiServer = spawn('php', ['-S', 'localhost:4005', '-t', 'api'], {
  stdio: 'inherit',
  shell: true,
});

// Start the Electron app
const electronApp = spawn('npm', ['run', 'electron:start'], {
  stdio: 'inherit',
  shell: true,
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  apiServer.kill();
  electronApp.kill();
  process.exit(0);
});

console.log('Development servers started. Press Ctrl+C to stop.'); 