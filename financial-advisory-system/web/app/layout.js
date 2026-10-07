import './globals.css';

export const metadata = {
  title: 'Financial Advisory System | Prolog Engine',
  description: 'Rule-based financial capital assessment and allocation guidance',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
