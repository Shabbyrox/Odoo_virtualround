import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isOnOperations = req.nextUrl.pathname.startsWith('/operations')
    const isOnProducts = req.nextUrl.pathname.startsWith('/products')
    const isOnSettings = req.nextUrl.pathname.startsWith('/settings')
    const isOnReports = req.nextUrl.pathname.startsWith('/reports')

    const isProtected = isOnDashboard || isOnOperations || isOnProducts || isOnSettings || isOnReports

    if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL('/login', req.nextUrl))
    }
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
