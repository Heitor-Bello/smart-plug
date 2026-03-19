import { BrandPanel } from "./_components/BrandPanel";
import { RegisterForm } from "./_components/RegisterForm";

export default function RegisterPage() {
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
