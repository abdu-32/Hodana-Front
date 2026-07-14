import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethiopia Innovation Hub",
  description: "Hackathon and innovation-challenge platform for Ethiopian universities, companies, NGOs, and government agencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
