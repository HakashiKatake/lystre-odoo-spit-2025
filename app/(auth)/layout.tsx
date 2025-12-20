export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F2E8DC]">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
