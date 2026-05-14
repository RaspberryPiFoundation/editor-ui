import { useEffect, useState } from "react";

const useIsOnline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // The service worker broadcasts OFFLINE whenever a network-first fetch falls back to cache, which reliably catches the case where navigator.onLine hasn't settled yet after a page reload when offline
    // This ensures that we can show "offline" state / UI immediately on page load when offline
    const handleSWMessage = ({ data }) => {
      if (data?.type === "OFFLINE") setIsOnline(false);
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

  return isOnline;
};

export default useIsOnline;
