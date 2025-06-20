
import type { Metadata } from 'next';
// Removed Inter font import as it's handled by direct Google Fonts link
import './globals.css';
import { ClientSessionProvider } from "@/components/ClientSessionProvider";


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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ClientSessionProvider>
          {children}
        </ClientSessionProvider>
      </body>
    </html>
  );
}
