import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';

export const metadata = {
  title: "ChatApp",
  description: "Real-time mesajlaşma uygulaması",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
