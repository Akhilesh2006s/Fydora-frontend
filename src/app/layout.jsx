import "./globals.css";
import AppShell from "../components/AppShell";
import brandLogo from "../../FashionForge.png";

export const metadata = {
  title: "FYDORA FORGE",
  description: "Luxury fashion marketplace by FYDORA FORGE",
  icons: {
    icon: [
      { url: brandLogo.src, type: "image/png" }
    ],
    shortcut: [{ url: brandLogo.src, type: "image/png" }],
    apple: [{ url: brandLogo.src, type: "image/png" }]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
