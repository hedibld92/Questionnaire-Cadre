import "./globals.css";

export const metadata = {
  title: "Questionnaire de fin de stage — HGE Louis Mourier",
  description: "Questionnaire anonyme de fin de stage du service d'Hépato-Gastro-Entérologie de Louis Mourier.",
  robots: { index: false, follow: false },
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
