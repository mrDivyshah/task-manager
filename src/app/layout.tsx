import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// No need to import Inter here if we are using the <link> tag method.
// The prompt specifically said:
// "IMPORTANT: This project will NOT manage fonts through the standard NextJS package.
// It will intentionally use <link> elements in <head> to import Google Fonts.
// DO NOT IMPORT the next/font package. DO NOT delete code related to Google Fonts in <head>."

export const metadata: Metadata = {
  title: 'TaskTango',
  description: 'Streamline your workflow with smart task management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
