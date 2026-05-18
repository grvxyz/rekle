import { User } from "lucide-react";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)              // split by any whitespace, handles double spaces
    .filter(Boolean)           // buang elemen kosong
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ProfileAvatar({ name, size = "md" }) {
  const sizeClass = {
    sm: "w-8 h-8 text-xs",
    md: "w-16 h-16 text-lg",
    lg: "w-24 h-24 text-2xl",
  }[size] ?? "w-16 h-16 text-lg";

  return (
    <div
      className={`${sizeClass} rounded-full bg-green-800 text-white flex items-center justify-center font-bold shrink-0`}
    >
      {name?.trim() ? getInitials(name) : <User size={20} />}
    </div>
  );
}

export default ProfileAvatar;