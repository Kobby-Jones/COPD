export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D1B2A] via-[#1B3A5C] to-[#0D1B2A]">
      {children}
    </div>
  );
}
