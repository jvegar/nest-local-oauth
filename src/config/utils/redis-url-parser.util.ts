import { RedisOptions } from 'ioredis';

export const redisUrlParser = (url: string): RedisOptions => {
  // Check if URL uses TLS
  const isTLS = url.startsWith('rediss://');

  // Extract the part after redis:// or rediss://
  const withoutProtocol = url.replace(/^rediss?:\/\//, '');

  // Initialize default options
  const options: RedisOptions = {
    host: '',
    port: 6379,
    tls: isTLS ? {} : undefined,
  };

  // Check if authentication part exists
  if (withoutProtocol.includes('@')) {
    // Split into auth and host parts
    const [auth, hostPart] = withoutProtocol.split('@');

    // Handle authentication
    if (auth.includes(':')) {
      const [username, password] = auth.split(':');
      if (username) options.username = decodeURIComponent(username);
      if (password) options.password = decodeURIComponent(password);
    } else {
      options.password = decodeURIComponent(auth);
    }

    // Handle host and port
    if (hostPart.includes(':')) {
      const [host, port] = hostPart.split(':');
      options.host = decodeURIComponent(host);
      options.port = parseInt(port, 10);
    } else {
      options.host = decodeURIComponent(hostPart);
    }
  } else {
    // No authentication, just host and port
    if (withoutProtocol.includes(':')) {
      const [host, port] = withoutProtocol.split(':');
      options.host = decodeURIComponent(host);
      options.port = parseInt(port, 10);
    } else {
      options.host = decodeURIComponent(withoutProtocol);
    }
  }

  // Validate port number
  if (isNaN(options.port) || options.port < 1 || options.port > 65535) {
    throw new Error('Invalid port number');
  }

  return options;
};
