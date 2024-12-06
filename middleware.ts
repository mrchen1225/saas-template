import { locales } from "@/lib/i18n";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/forum(.*)",
  "/workbench(.*)",
]);

const baseMatcher = createRouteMatcher(["/api(.*)"]);

const isApiRoute = (path: NextRequest) => {
  if (baseMatcher(path)) {
    const res = !path.url.includes("/api/blog") &&!path.url.includes("/api/upload") && !path.url.includes("/api/picture") &&  !path.url.includes("/api/webhook") && !path.url.includes("/api/admin");
    return res;
  }
  return false;
};

const PUBLIC_FILE = /\.(.*)$/;
const PUBLIC_FOLDER = /^\/models\//;  // 新增：匹配 public 文件夹

const notNeedI18NRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const needI18NRouteRedirect = createRouteMatcher([
  "/((?!api|_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|js|css|woff|woff2|ttf|eot)).*)",
]);

// 如果路径不匹配，内部重定向到 404 页面
const matchedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/forum(.*)",
  "/workbench(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/_next(.*)",
  "/en/api(.*)",
  '(.*)/blog(.*)', // 这条规则允许对 /blog 的公开访问
  '(.*)/blog(.*)/(.*)', // 这条规则允许对 /blog 的公开访问
  '(.*)/blog(.*)/(.*)/(.*)', // 这条规则允许对 /blog 的公开访问
  '(.*)/blog(.*)/(.*)/(.*)/(.*)', // 这条规则允许对 /blog 的公开访问
  "/((?!.*\\.(?:ico|png|svg|jpg|jpeg|xml|txt)$).*)",
]);

export default clerkMiddleware((auth, req) => {
  console.log("req.url: ", req.url);


  // if (req.nextUrl.pathname.startsWith('/blog')) {
  //   // 创建一个新的 URL
  //   const newUrl = `https://blog.aidisturbance.online${req.nextUrl.pathname}`;

  //   // 重写请求
  //   req.nextUrl.hostname = 'blog.aidisturbance.online';
  //   req.nextUrl.protocol = 'https';
  //   return NextResponse.rewrite(newUrl);
  // }

  // auth
  if (isProtectedRoute(req)) {
    console.log("auth protect!!!");
    auth().protect();
  }
  if (isApiRoute(req)) {
    const authObject = auth();
    if (!authObject.userId) {
      return new NextResponse("Unauthorized, please sign in.", { status: 401 });
    }
  }
  console.log("auth pass!!");

  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.includes("/api/") ||
    PUBLIC_FILE.test(req.nextUrl.pathname) ||
    PUBLIC_FOLDER.test(req.nextUrl.pathname)  // 新增：检查是否为 public 文件夹
  ) {
    console.log("return!");
    return;
  }
  console.log("needI18NRouteRedirect pass!!");

  const { pathname } = req.nextUrl;
  const defaultLocale = "en"; // 这里可以根据需要设置默认的 locale

  // 检查路径是否包含 locale 前缀
  const locale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // 如果路径是 `/en/{任意page}`，则重定向到 `/{任意page}`
  if (pathname.startsWith(`/${defaultLocale}/`)) {
    const newPathname = pathname.replace(`/${defaultLocale}/`, "/");
    return NextResponse.redirect(new URL(newPathname, req.url));
  }

  // 如果路径不包含 locale 前缀，则内部重定向到 `/en/{非locale page}`
  if (!locale && !PUBLIC_FOLDER.test(req.nextUrl.pathname)) {  // 修改：增加对 public 文件夹的检查
    console.log("does not contain locale, rewrite to /en: ", pathname);
    req.nextUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.rewrite(req.nextUrl);
  }

  // 其他逻辑：根路径重定向等
  if (pathname === "/") {
    req.nextUrl.pathname = `/${defaultLocale}`;
    return NextResponse.rewrite(req.nextUrl);
  }

  if (locale === defaultLocale && needI18NRouteRedirect(req)) {
    req.nextUrl.pathname = `/${locale}${req.nextUrl.pathname}`;
    return NextResponse.rewrite(req.nextUrl);
  }

  if (!matchedRoute(req)) {
    req.nextUrl.pathname = "/404";
    return NextResponse.rewrite(req.nextUrl);
  }



});

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|js|css|woff|woff2|ttf|eot)).*)",
//   ],
// };

export const config = {
  // Skip Next.js internals and all static files, unless found in search params
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // '/_next/(.*)',
    '/blog/(.*)'
  ],
};
