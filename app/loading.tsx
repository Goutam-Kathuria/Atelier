"use client";

import { usePathname } from "next/navigation";

export default function Loading() {
  const pathname = usePathname();
  const space = pathname?.startsWith("/space");
  const luxury = pathname?.startsWith("/luxury");
  const theme = space ? "space" : luxury ? "luxury" : "luxury";

  return (
    <main className={`server-loading server-loading-${theme}`} aria-label="Loading experience">
      <div className="server-loading-top">
        <span>{space ? "NOVA / 01" : "ATELIER / 09"}</span>
        <span>INITIALISING</span>
      </div>
      <div className="server-loading-center">
        <div className="server-loading-orbit"><i /><i /><i /></div>
        <p>{space ? "Establishing signal" : "Entering the atelier"}</p>
      </div>
      <div className="server-loading-bottom">
        <span>LOAD</span><span className="server-loading-line" /><span>01</span>
      </div>
    </main>
  );
}
