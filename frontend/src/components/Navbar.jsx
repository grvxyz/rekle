import logo from "../logo.svg";
import Button from "./ui/button.jsx";

function Navbar() {
  return (
    <header className="w-full bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between">
        <a
          href="/"
          className="inline-flex items-center gap-3 text-foreground no-underline"
          aria-label="REKLE home"
        >
          <img src={logo} alt="Logo REKLE" className="h-10 w-10 rounded-2xl" />
          <span className="block">
            <strong className="block text-lg font-black tracking-[0.04em]">
              REKLE
            </strong>
          </span>
        </a>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            as="a"
            href="/login"
            variant="default"
            className="px-8 py-2 rounded-full"
          >
            Login
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
