export const metadata = {
  title: "Agentic Human Art Generator",
  description: "Generate human art images and upload to Instagram"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        background: '#0b0f14',
        color: '#e6edf3',
        margin: 0,
        minHeight: '100vh'
      }}>
        {children}
      </body>
    </html>
  );
}
