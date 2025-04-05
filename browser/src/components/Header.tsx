import Link from "next/link";

export default function Header() {
  return (
    <header className="flex flex-wrap justify-between p-5 mb-5">
      <Link
        href="/"
        className="text-xl md:mb-auto mb-5 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500"
      >
        Semaphore & RLN Benchmarks
      </Link>
    </header>
  );
}
