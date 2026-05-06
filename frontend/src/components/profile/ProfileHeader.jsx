import ProfileAvatar from "./ProfileAvatar.jsx";

function ProfileHeader({ name, email }) {
  return (
    <div className="flex items-center gap-4">
      <ProfileAvatar name={name} />

      <div>
        <p className="font-medium">{name || "Nama User"}</p>
        <p className="text-sm text-gray-400">{email}</p>
      </div>
    </div>
  );
}

export default ProfileHeader;