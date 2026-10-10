import { redirect } from "next/navigation";

// Middleware already sends unauthenticated visitors to /platform/login and
// authenticated owners belong at the dashboard — this bare index just picks
// the right one for a direct hit on "/platform".
export default function PlatformIndex() {
  redirect("/platform/dashboard");
}
