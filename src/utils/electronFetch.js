const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * A custom fetch implementation that bypasses CSP restrictions
 * by using Node.js http/https modules directly
 */
function electronFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = requestModule.request(requestOptions, res => {
      let data = '';

      // Handle response data
      res.on('data', chunk => {
        data += chunk;
      });

      // Handle end of response
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data)),
        });
      });
    });

    // Handle request errors
    req.on('error', error => {
      reject(error);
    });

    // Send request body if provided
    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

module.exports = electronFetch;
