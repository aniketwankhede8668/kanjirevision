import "./globals.css";
export const metadata = { title: "Kanji Test" };
export default function RootLayout({ children }) {
  return (<html lang="hi"><body>{children}</body></html>);
}
