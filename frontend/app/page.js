import Link from "next/link";
import CardWithLink from "./components/card-with-link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold tracking-wide">
        Next Online Banking 🌏
      </h1>
      <p className="mt-2 text-primary text-lg tracking-wider">
        Welcome to our platform, what would you like to do today?
      </p>
      <div className="mt-4 min-w-3xl p-20 flex flex-col md:flex-row gap-20 mx-8">
        {/* Card 1 */}
        <CardWithLink 
          href="/create-nin"
          name="nin"
          variant="success"
          title="Create NIN"
          description="Create NIN with next bank today"
        />
       
        {/* Card 2 */}
        <CardWithLink 
          href="/create-account"
          name="account"
          variant="primary"
          title="Create Account"
          description="Create an account with next bank today"
        />
       
        {/* Card 3 */}
        <CardWithLink 
          href="/login"
          name="login"
          title="Login"
          description="Login to your next bank account today"
        />
  
      </div>
      <div className="tracking-wider mt-2">
        <p className="text-lg">
          You can view our{" "}
          <Link href="#" className="link-error">
            privacy policy
          </Link>{" "}
          &{" "}
          <Link href="#" className="link-primary">
            terms & conditions
          </Link>
        </p>
      </div>
      <div className="tracking-wider mt-8">
        <p>Made with ❤️ by the <b>next online banking team</b> &copy; 2026</p>
      </div>
    </div>
  );
}
