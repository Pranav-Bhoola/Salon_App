import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SalonOS Dashboard',
  description: 'Phase 1 MVP control panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&family=Source+Sans+3:wght@400;600&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}
