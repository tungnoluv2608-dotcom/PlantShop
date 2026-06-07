import { useEffect } from "react"
import { useNavigation } from "react-router"
import NProgress from "nprogress"

NProgress.configure({ showSpinner: false, trickleSpeed: 120 })

/** Drives the top route-progress bar from the data router's navigation state. */
export function useRouteProgress() {
  const navigation = useNavigation()

  useEffect(() => {
    if (navigation.state === "loading") {
      NProgress.start()
    } else {
      NProgress.done()
    }
  }, [navigation.state])
}
