import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Skill-Sync',
  description: 'Developer cognitive load analyzer with synchronized code viewing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}