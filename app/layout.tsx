import type { Metadata, Viewport } from 'next'
import { Geist, Libre_Baskerville } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const libre = Libre_Baskerville({ subsets: ['latin'], variable: '--font-libre', weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'Arbitration & Dispute Resolution Centre | Hyderabad',
  description: 'Independent institutional arbitration, distinguished tribunals, modern rules, transparent fees, and secure case management from Hyderabad, India.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#080e14',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`bg-background ${geist.variable} ${libre.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
