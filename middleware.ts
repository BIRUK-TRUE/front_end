import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

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
  const response = intlMiddleware(request);
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return response;
  }

  const locale = getLocaleFromPath(pathname);
  const isProtectedRoute =
    pathname.startsWith(`/${locale}/dashboard`);

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
