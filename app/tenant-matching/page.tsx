import { Suspense } from "react";
import TenantMatching from "@/app/modules/tenant-matching/tenant-matching";

export default function TenantMatchingPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <TenantMatching />
    </Suspense>
  );
}
