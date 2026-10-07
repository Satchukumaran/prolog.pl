import './globals.css';

export const metadata = {
  title: 'Financial Advisory System',
  description: 'Rule-based financial planning and investment guidance system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
