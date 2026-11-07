"use client";
import { useEffect } from "react";
export function PublicOfflineSupport() {
  useEffect(() => { if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => undefined); }, []);
  return null;
}
