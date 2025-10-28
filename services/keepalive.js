const https = require('https');
const http = require('http');

class KeepAliveService {
  constructor(serverUrl, interval = 14 * 60 * 1000) { // Default: 14 minutes
    this.serverUrl = serverUrl;
    this.interval = interval;
    this.intervalId = null;
    this.isRunning = false;
    this.pingCount = 0;
    this.startTime = Date.now();
  }

  // Ping the server to keep it alive
  ping() {
    const url = `${this.serverUrl}/keepalive`;
    const protocol = url.startsWith('https') ? https : http;
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const req = protocol.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          this.pingCount++;
          
          if (res.statusCode === 200) {
            console.log(`✅ Keepalive ping #${this.pingCount} successful - ${responseTime}ms`);
            console.log(`📊 Server uptime: ${this.getFormattedUptime()}`);
            resolve({ success: true, responseTime, data });
          } else {
            console.log(`⚠️ Keepalive ping returned status ${res.statusCode}`);
            resolve({ success: false, statusCode: res.statusCode, data });
          }
        });
      });

      req.on('error', (error) => {
        console.error(`❌ Keepalive ping failed:`, error.message);
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  // Start the keepalive service
  start() {
    if (this.isRunning) {
      console.log('⚠️ Keepalive service is already running');
      return;
    }

    console.log(`🚀 Starting keepalive service for ${this.serverUrl}`);
    console.log(`⏰ Ping interval: ${this.interval / 1000 / 60} minutes`);
    
    this.isRunning = true;
    this.startTime = Date.now();

    // Initial ping
    this.ping().catch(error => {
      console.error('Initial ping failed:', error.message);
    });

    // Set up interval
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.ping().catch(error => {
          console.error('Scheduled ping failed:', error.message);
        });
      }
    }, this.interval);

    console.log(`✅ Keepalive service started successfully`);
  }

  // Stop the keepalive service
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Keepalive service is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log(`🛑 Keepalive service stopped after ${this.pingCount} pings`);
  }

  // Get formatted uptime
  getFormattedUptime() {
    const uptimeMs = Date.now() - this.startTime;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      serverUrl: this.serverUrl,
      interval: this.interval,
      pingCount: this.pingCount,
      uptime: this.getFormattedUptime(),
      startTime: new Date(this.startTime).toISOString()
    };
  }
}

module.exports = KeepAliveService;
