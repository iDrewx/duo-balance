import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserSettingsProvider } from "@/context/UserSettingsContext";
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
    <html lang="es-MX" className="h-full light" style={{ colorScheme: 'light dark' }}>
      <body className={`${inter.variable} ${manrope.variable} h-full antialiased light`}>
        <AuthProvider>
          <ThemeProvider>
            <UserSettingsProvider>
              {children}
            </UserSettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}