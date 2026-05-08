import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="nav">
      <Link href="/" className="brand">
        <span className="logo">5D</span>
        <span className="brand-name">FiveD Studio</span>
      </Link>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/live/">Live</Link>
        <Link href="/leetcode/">LeetCode</Link>
        <a
          className="nav-cta"
          href="https://github.com/fived-studio"
          target="_blank"
          rel="noopener noreferrer"
        >
          github →
        </a>
      </nav>
    </header>
  );
}
