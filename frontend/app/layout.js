import { Roboto } from "next/font/google";
import "./globals.css";
import ThemeWrapper from "./components/theme-wrapper";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  style: ["normal", "italic"], // Optional: remove if you don't need italics
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    template: "%s | Next Bank",
    default: "Next Bank",
  },
  description: "This is a next bank app",
};


export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${roboto.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeWrapper>
        {children}
        </ThemeWrapper>
      </body>
    </html>
  );
}
