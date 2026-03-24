import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { ProfileHeader } from "./_components/ProfileHeader";
import { ProfileForm } from "./_components/ProfileForm";
import { ButtonSignOut } from "./_components/button-signout";

export default async function Profile() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;
  const nameParts = user.name?.split(" ") ?? [""];
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") ?? "";

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <ProfileHeader
          name={user.name ?? "Usuário"}
          email={user.email ?? ""}
          avatarUrl={user.image ?? undefined}
          badges={[
            { label: "Platinum User", variant: "tertiary" },
            { label: "Energy Admin", variant: "primary" },
          ]}
        />

        <ProfileForm
          defaultValues={{
            firstName,
            lastName,
            email: user.email ?? "",
            phone: "",
            language: "pt-BR",
          }}
        />

        <div className="flex justify-center pt-4">
          <ButtonSignOut />
        </div>
      </div>
    </main>
  );
}
