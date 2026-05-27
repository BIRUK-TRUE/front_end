import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: true,
});

const PUBLIC_ROUTE_PATTERNS = [
  /^\/[a-z]{2}\/?$/i,
  /^\/[a-z]{2}\/login\/?$/i,
  /^\/[a-z]{2}\/forgot-password\/?$/i,
  /^\/[a-z]{2}\/reset-password\/?$/i,
];

const ROLE_ROUTE_RULES = [
  { pattern: /^\/[a-z]{2}\/dashboard\/teacher(\/|$)/i, roles: ['teacher'] },
  { pattern: /^\/[a-z]{2}\/dashboard\/guardian(\/|$)/i, roles: ['guardian'] },
  { pattern: /^\/[a-z]{2}\/dashboard\/student(\/|$)/i, roles: ['student'] },
  { pattern: /^\/[a-z]{2}\/guardian(\/|$)/i, roles: ['guardian'] },
];

function getLocaleFromPath(pathname: string) {
  return pathname.split('/').filter(Boolean)[0] || routing.defaultLocale;
}

function parseRoles(rawRoles: string | undefined) {
  if (!rawRoles) return [];

  try {
    const parsed = JSON.parse(rawRoles);
    return Array.isArray(parsed)
      ? parsed.filter((role): role is string => typeof role === 'string')
      : [];
  } catch {
    return [];
  }
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle root path - redirect to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}`, request.url));
  }

  const response = intlMiddleware(request);
  
  // Check if user is accessing just the locale root (e.g., /en or /am)
  const localeMatch = pathname.match(/^\/([a-z]{2})\/?$/i);
  if (localeMatch) {
    const locale = localeMatch[1];
    // Redirect to login page for the locale
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return response;
  }

  const locale = getLocaleFromPath(pathname);
  // Protect /dashboard/* AND the standalone /guardian/* route group
  const isProtectedRoute =
    pathname.startsWith(`/${locale}/dashboard`) ||
    pathname.startsWith(`/${locale}/guardian`);

  if (!isProtectedRoute) {
    return response;
  }

  const accessToken = request.cookies.get('auth-token')?.value;
  if (!accessToken) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const mustChangePassword =
    request.cookies.get('must-change-password')?.value === 'true';
  if (
    mustChangePassword &&
    pathname !== `/${locale}/change-password` &&
    pathname !== `/${locale}/dashboard/change-password`
  ) {
    return NextResponse.redirect(
      new URL(`/${locale}/change-password`, request.url)
    );
  }

  const roles = parseRoles(request.cookies.get('auth-roles')?.value);
  const rule = ROLE_ROUTE_RULES.find(({ pattern }) => pattern.test(pathname));

  if (rule && !rule.roles.some((role) => roles.includes(role))) {
    return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
