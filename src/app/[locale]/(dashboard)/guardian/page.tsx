import { Metadata } from "next";
import GuardianPageClient from "./GuardianPageClient";

export const metadata: Metadata = {
  title: "Guardian Dashboard | SMS",
  description: "Manage your children's academic progress and fees.",
};

export default function GuardianPage() {
  return <GuardianPageClient />;
}
