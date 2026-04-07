"use client";

import { Button } from "@/components/ui/Button";
import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type ButtonSignOutProps = Omit<ComponentProps<typeof Button>, "onClick">;

export function ButtonSignOut({ children = "Sair da conta", ...props }: ButtonSignOutProps) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess() {
          router.replace("/");
        },
      },
    });
  }

  return <Button onClick={signOut} {...props}>{children}</Button>;
}
