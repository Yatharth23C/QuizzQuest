// middleware.js
export { default } from 'next-auth/middleware';


export const config = {
  matcher: [
    "/((?!auth/login|$).*)",  // Exclude root and login paths
  ],
};
