import { useEffect } from "react";
import { useLocation } from "react-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  showSpinner: false,
  speed: 300,
  minimum: 0.2,
  trickleSpeed: 150,
});

export function TopProgressBar() {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();

    const timer = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);

  return null;
}
