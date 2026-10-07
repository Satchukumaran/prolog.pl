import './globals.css';

export const metadata = {
  title: 'Financial Advisory System',
  description: 'Rule-based financial planning and investment guidance system',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0284c7',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

