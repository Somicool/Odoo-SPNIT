import '../styles/globals.css'
import React from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Providers from '../components/Providers'

export const metadata = {
  title: 'StockMaster',
};

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
