import './globals.css'
import type { Metadata } from 'next'
import ClientLayout from '@/components/Layout/ClientLayout'

export const metadata: Metadata = {
  title: 'File Management System',
  description: 'A modern file management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
} 