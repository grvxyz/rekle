import Badge from "./badge.jsx";

function SectionHeader({ badge, title, description, centered = false, dark = false }) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {badge && (
        <Badge variant={dark ? "dark" : "default"}>
          {badge}
        </Badge>
      )}
      <h2
        className={`mt-4 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl whitespace-nowrap ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-base leading-8 sm:text-lg ${
            dark ? "text-emerald-50/85" : "text-slate-600"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default SectionHeader;
