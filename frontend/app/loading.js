import Link from "next/link";
import CardWithLink from "./components/card-with-link";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold tracking-wide">
         Loading
         <span className="loading loading-dots loading-md" /> 
         🌏
      </h1>
      
    </div>
  );
}
