"use client";

import { usePathname } from "next/navigation";
import TopBar from "./TopBar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <>
      {!isHomePage && <TopBar />}
      <div className={!isHomePage ? "pt-6" : ""}>
        {children}
      </div>
    </>
  );
}
