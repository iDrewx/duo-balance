import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const manrope = Manrope({ subsets: ["latin"], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: "DuoBalance",
  description: "Control de gastos compartidos para dos",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className="h-full">
      <body className={`${inter.variable} ${manrope.variable} h-full antialiased`} style={{ background: '#f9f9f9' }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}