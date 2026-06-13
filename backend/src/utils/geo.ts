import crypto from 'crypto';
import useragent from 'useragent';
import geoip from 'geoip-lite';

export interface RequestAnalyticsData {
  device: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  ipHash: string;
}

/**
 * Hashes an IP address using SHA256 to ensure visitor privacy.
 */
export function hashIp(ip: string): string {
  const salt = 'linkforge_ai_ip_salt_protection_hash';
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

/**
 * Parses request details into structured user agent and geographic metadata.
 */
export function parseRequestDetails(userAgentStr: string, ipAddress: string): RequestAnalyticsData {
  // 1. User Agent Parsing
  const agent = useragent.parse(userAgentStr);
  const os = agent.os.toString() || 'Unknown OS';
  const browser = agent.toAgent() || 'Unknown Browser';

  // Device determination
  let device = 'Desktop';
  const ua = userAgentStr.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = 'Tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(ua)) {
    device = 'Mobile';
  } else if (/smart-tv|smarttv|googletv|appletv|hbbtv|poxee|roku/i.test(ua)) {
    device = 'Smart TV';
  }

  // 2. Geolocation lookup (support proxies, local IPs)
  let ip = ipAddress;
  // Clean IPv6 prefix for IPv4-mapped addresses
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  // Handle local development IPs
  let country = 'Unknown';
  let city = 'Unknown';

  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    country = 'Localhost';
    city = 'Internal Network';
  } else {
    try {
      const geo = geoip.lookup(ip);
      if (geo) {
        country = geo.country || 'Unknown';
        city = geo.city || 'Unknown';
      }
    } catch {
      // geoip database lookup error or uninitialized
      country = 'Unknown';
      city = 'Unknown';
    }
  }

  return {
    device,
    browser,
    os,
    country,
    city,
    ipHash: hashIp(ipAddress),
  };
}
