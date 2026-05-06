import { User } from "lucide-react";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ProfileAvatar({ name }) {
  return (
    <div className="w-16 h-16 rounded-full bg-green-800 text-white flex items-center justify-center text-lg font-bold">
      {name ? getInitials(name) : <User size={20} />}
    </div>
  );
}

export default ProfileAvatar;