import './globals.css';
import QueryProvider from '../providers/QueryProvider';
import { SocketProvider } from '../providers/SocketProvider';
import Navbar from '../components/Navbar';
import ToastContainer from '../components/ToastContainer';

export const metadata = {
  title: 'OmniStore - Multi-Store Order Management Platform',
  description: 'Real-time multi-store order processing, live WebSockets, data archival, and aggregation analytics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <QueryProvider>
          <SocketProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <ToastContainer />
            <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
              OmniStore Management Platform &bull; Node.js Express + Next.js + MongoDB + Socket.IO
            </footer>
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
