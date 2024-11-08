// middleware.js
export { default } from 'next-auth/middleware';

// Protect all routes except the landing ("/") and login ("/auth/login") pages
export const config = {
  matcher: [
    "/((?!auth/login|$).*)",  // Exclude root and login paths
  ],
};
