import NextAuth from 'next-auth';
import createMiddleware from 'next-intl/middleware';

import { authConfig } from '@/auth.config';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth(req => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const isAdmin = req.auth?.user?.role === 'ADMIN';

  const localePattern = new RegExp(`^/(${routing.locales.join('|')})/?`, 'i');
  const pathWithoutLocale = nextUrl.pathname.replace(localePattern, '/') || '/';

  const isAuthRoute =
    pathWithoutLocale.startsWith('/login') ||
    pathWithoutLocale.startsWith('/register') ||
    pathWithoutLocale.startsWith('/forgot-password') ||
    pathWithoutLocale.startsWith('/reset-password');
  const isAdminRoute = pathWithoutLocale.startsWith('/admin');
  const isUserRoute =
    pathWithoutLocale.startsWith('/trips') ||
    pathWithoutLocale.startsWith('/settings');

  if (isAuthRoute && isAuthenticated) {
    const redirectUrl = new URL(`/${routing.defaultLocale}/trips`, nextUrl);
    return Response.redirect(redirectUrl);
  }

  if ((isAdminRoute || isUserRoute) && !isAuthenticated) {
    const loginUrl = new URL(
      `/${routing.defaultLocale}/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`,
      nextUrl,
    );
    return Response.redirect(loginUrl);
  }

  if (isAdminRoute && !isAdmin) {
    const fallbackUrl = new URL(`/${routing.defaultLocale}/trips`, nextUrl);
    return Response.redirect(fallbackUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
