import './globals.css'

export const metadata = {
  title: 'ARD Developers - Event Platform',
  description: 'Lead capture, brochure delivery, and Lucky Draw platform for ARD Developers events.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
