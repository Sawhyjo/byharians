const https = require('https');
const dns = require('dns').promises;
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pqelwrcierxjrpwcbbxe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_U3RH0VO3rDZpGPVVJj0-0w_Idtot050';

// Configure DNS resolver using reliable public DNS servers (Google / Cloudflare)
// to bypass ISP DNS redirection / interception issues.
const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

function customLookup(hostname, opts, cb) {
  const callback = typeof opts === 'function' ? opts : cb;
  const isAll = typeof opts === 'object' && opts && opts.all;
  resolver.resolve4(hostname)
    .then(ips => {
      if (isAll) {
        callback(null, ips.map(ip => ({ address: ip, family: 4 })));
      } else {
        callback(null, ips[0], 4);
      }
    })
    .catch(err => callback(err));
}

// Custom fetch wrapper with DNS resolver for all Supabase HTTPS calls
function customFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(url);
      const headers = {};
      if (options.headers) {
        if (typeof options.headers.forEach === 'function') {
          options.headers.forEach((v, k) => { headers[k] = v; });
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([k, v]) => { headers[k] = v; });
        } else {
          Object.assign(headers, options.headers);
        }
      }

      const reqOpts = {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method: options.method || 'GET',
        headers,
        lookup: customLookup
      };

      const req = https.request(reqOpts, res => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const text = buffer.toString('utf8');
          resolve(new Response(text, {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers
          }));
        });
      });

      req.on('error', reject);
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

let supabase = null;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { fetch: customFetch },
    global: { fetch: customFetch }
  });
  console.log('⚡ Supabase Client initialized with Google DNS resolver in Node.js backend');
} catch (err) {
  console.warn('⚠️ Supabase init warning in backend:', err.message);
}

module.exports = {
  supabase,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
};
