import Image from "next/image";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarUrl?: string;
  badges?: { label: string; variant: "primary" | "tertiary" | "muted" }[];
}

export function ProfileHeader({
  name,
  email,
  avatarUrl,
  badges = [],
}: ProfileHeaderProps) {
  return (
    <div className="bg-card rounded-xl p-6">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`Avatar de ${name}`}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-foreground">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Edit avatar button */}
          <button
            type="button"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
            aria-label="Editar avatar"
          >
            <Pencil size={14} className="text-primary-foreground" />
          </button>
        </div>

        {/* User info */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">{name}</h1>
          <p className="text-muted-foreground">{email}</p>
          
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {badges.map((badge) => (
                <Badge key={badge.label} variant={badge.variant}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
