import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  forceMode?: "light" | "dark";
}

export function Logo({ className = "", forceMode }: LogoProps) {
  return (
    <Link
      href="/"
      onClick={() => (window.location.href = "/")}
      className={`flex items-center ${className}`}
    >
      {forceMode ? (
        <Image
          src={forceMode === "dark" ? "/logo-darkmode.svg" : "/logo-lightmode.svg"}
          alt="CFC Events"
          width={112}
          height={40}
          className="h-10 w-auto"
          priority
        />
      ) : (
        <>
          <Image
            src="/logo-lightmode.svg"
            alt="CFC Events"
            width={112}
            height={40}
            className="h-10 w-auto dark:hidden"
            priority
          />
          <Image
            src="/logo-darkmode.svg"
            alt="CFC Events"
            width={112}
            height={40}
            className="h-10 w-auto hidden dark:block"
            priority
          />
        </>
      )}
    </Link>
  );
}
