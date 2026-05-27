import { useEffect, useState } from "react";

const useIsOnline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // The host page's service worker broadcasts OFFLINE when a network-first fetch falls back to cache, and ONLINE when the network becomes reachable again after a cache fallback period
    const handleSWMessage = ({ data }) => {
      if (data?.type === "OFFLINE") setIsOnline(false);
      if (data?.type === "ONLINE") setIsOnline(true);
    };
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleSWMessage);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      }
    };
  }, []);

  // While offline, ask the controlling service worker to probe the network.
  // navigator.onLine alone is unreliable. The SW performs a real fetch and responds with ONLINE/OFFLINE based on whether it succeeds
  useEffect(() => {
    if (isOnline || !("serviceWorker" in navigator)) return;
    const interval = setInterval(() => {
      navigator.serviceWorker.controller?.postMessage({ type: "CHECK_ONLINE" });
    }, 3000);
    return () => clearInterval(interval);
  }, [isOnline]);

  return isOnline;
};

export default useIsOnline;
