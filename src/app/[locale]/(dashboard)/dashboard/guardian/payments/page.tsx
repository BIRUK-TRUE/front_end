import { Metadata } from "next";
import { GuardianPaymentsPage } from "@/features/guardian-portal/components/GuardianPaymentsPage";

export const metadata: Metadata = {
  title: "Fees & Payments | Guardian Portal",
  description: "View and pay school fees for your children.",
};

export default function PaymentsPage() {
  return <GuardianPaymentsPage />;
}
