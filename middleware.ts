import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/(.*)", // This catches all API routes
  "/events(.*)",
  "/chauffeurs(.*)",
  "/cars(.*)",
  "/rides(.*)",
  "/clients(.*)",
  "/users(.*)",
  "/partners(.*)",
  "/settings(.*)",
]);

// Add matcher for public mobile routes
const isMobileRoute = createRouteMatcher([
  "/api/mobile/(.*)", // All mobile API routes
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip auth check for mobile routes
  if (isMobileRoute(req)) {
    console.log("Skipping auth check for mobile route");
    console.log(req.body, req.url, req.method);
    return;
  }

  // Protect all other routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/api/(.*)"],
};
