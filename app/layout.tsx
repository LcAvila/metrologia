import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import "./components/datepicker.css";
import { ThemeProvider } from "./context/ThemeContext";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AVZ Quality",
  description: "Sistema integrado de gestão de metrologia e FDUs - Precisão e Segurança em Harmonia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/assets/favicon/favicon.ico" type="image/x-icon" />
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
      </head>
      <body
        className={`${inter.className} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
