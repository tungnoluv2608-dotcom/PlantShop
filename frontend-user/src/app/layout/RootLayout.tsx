import { useEffect } from "react"
import { Outlet, ScrollRestoration, useLocation } from "react-router"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

NProgress.configure({ showSpinner: false })

function useRouteProgress() {
  const location = useLocation()
  useEffect(() => {
    NProgress.start()
    const timer = window.setTimeout(() => NProgress.done(), 250)
    return () => {
      window.clearTimeout(timer)
      NProgress.done()
    }
  }, [location.pathname])
}

export function RootLayout() {
  useRouteProgress()
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
