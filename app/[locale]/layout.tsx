export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background font-sans">{children}</div>;
}
