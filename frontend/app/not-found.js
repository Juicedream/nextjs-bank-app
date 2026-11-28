import Link from "next/link";
import CardWithLink from "./components/card-with-link";

export default function NotFound() {
  return (
    <div className="min-w-screen min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold tracking-wide">
        Oops, Page not Found 😔
      </h1>

      <div className="mt-2 min-w-3xl p-10 flex flex-col md:flex-row items-center md:justify-center mx-8">
        <CardWithLink href="/" name="home" title="Go Home" />
      </div>
    </div>
  );
}
