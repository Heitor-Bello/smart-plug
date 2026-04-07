import { Suspense } from "react";
import { LoginBrandPanel } from "@/app/login/_components/LoginBrandPanel";
import { ResetPasswordForm } from "./_components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-background flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:block lg:w-1/2 p-6">
        <LoginBrandPanel />
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
