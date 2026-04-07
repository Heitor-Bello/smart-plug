import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { BrandPanel } from "./_components/BrandPanel";
import { RegisterForm } from "./_components/RegisterForm";

export default async function RegisterPage() {
  const session = await getServerSession();
  if (session) redirect("/dashboard");
  return (
    <main className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-background">
        <BrandPanel />
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 bg-card">
        <RegisterForm />
      </div>
    </main>
  );
}
