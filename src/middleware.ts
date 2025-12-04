export { default } from "next-auth/middleware"

export const config = { 
  matcher: [
    "/api/users/:path*",
    "/api/books/:path*",
    "/api/loans/:path*",
    "/api/fines/:path*",
    "/api/reports/:path*",
    "/users/:path*",
    "/books/:path*",
  ] 
};
