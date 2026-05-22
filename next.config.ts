import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.43.63', '172.31.176.1', 'localhost', '192.168.137.24', '192.168.137.124', '192.168.137.97', '172.18.144.76','192.168.137.208'],
};

export default withNextIntl(nextConfig);
