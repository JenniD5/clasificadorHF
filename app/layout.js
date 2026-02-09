
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "Inter, Arial, sans-serif", background: "#f4f6f9" }}>
        {children}
      </body>
    </html>
  );
}
