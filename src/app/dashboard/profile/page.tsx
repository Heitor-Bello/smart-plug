import { getServerSession } from "@/lib/session";
import { ProfileHeader } from "./_components/profile-header";
import { ProfileForm } from "./_components/profile-form";
import { ButtonSignOut } from "./_components/button-signout";

export default async function ProfilePage() {
  const session = await getServerSession();
  const user = session!.user;

  const nameParts = user.name?.split(" ") ?? [""];
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") ?? "";

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <ProfileHeader
          name={user.name ?? "Usuário"}
          email={user.email ?? ""}
          avatarUrl={user.image ?? undefined}
        />

        <ProfileForm
          defaultValues={{
            firstName,
            lastName,
            email: user.email ?? "",
          }}
        />

        <div className="flex justify-center pt-4">
          <ButtonSignOut />
        </div>
      </div>
    </div>
  );
}
