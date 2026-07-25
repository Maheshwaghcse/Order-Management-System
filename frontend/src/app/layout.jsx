import './globals.css';
import QueryProvider from '../providers/QueryProvider';
import { SocketProvider } from '../providers/SocketProvider';
import Navbar from '../components/Navbar';
import ToastContainer from '../components/ToastContainer';

export const metadata = {
  title: 'Puneri Swad - Pune Food Store Order Management',
  description: 'Order management platform for Pune food branches featuring iconic Pune delicacies.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 min-h-screen flex flex-col antialiased">
        <QueryProvider>
          <SocketProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <ToastContainer />
            <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
              Puneri Swad Food Store &bull; Pune, Maharashtra 📍
            </footer>
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
