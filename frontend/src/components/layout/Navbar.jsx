import logo from "../../logo.svg";
import Button from "../ui/button.jsx";

function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          <a
            href="/"
            className="inline-flex items-center gap-3 text-white no-underline"
            aria-label="REKLE home"
          >
            <img
              src={logo}
              alt="Logo REKLE"
              className="h-10 w-10 rounded-2xl"
            />
            <strong className="text-lg font-black tracking-[0.04em]">
              REKLE
            </strong>
          </a>

          <div className="flex items-center gap-3">
            <Button
              as="a"
              href="/login"
              className="px-6 py-2 rounded-full"
            >
              Login
            </Button>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Navbar;