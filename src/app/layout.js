
// Importações
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";


 const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
 });

  const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
 });

  export const metadata = {
  title: "Sky Counter",
  description: "Sistema para cálculo de preço/cotações de viagens com milhas.",
  };

  // Itens em todas as páginas
  export default function RootLayout({children}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ant ialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        {children}
      
         </ThemeProvider>
      </body>
    </html>
  )};
