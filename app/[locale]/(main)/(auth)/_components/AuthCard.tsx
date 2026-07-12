import { JourneyIllustration } from '@/components/layout/JourneyIllustration';

export default function AuthCard({
  children,
  mirrored,
}: {
  children: React.ReactNode;
  mirrored: boolean;
}) {
  return (
    <div className="group relative w-full min-h-80 bg-background rounded-3xl shadow-2xl overflow-hidden cursor-default">
      <div className="absolute top-[-30%] inset-s-[-10%] w-full sm:w-[85%] md:w-[75%] lg:w-[65%] h-[140%] pointer-events-none z-0">
        <div className="w-full h-full bg-linear-to-br from-primary to-[color-mix(in_srgb,var(--primary),black_40%)] rounded-[40%] transition-transform duration-700 ease-out group-hover:translate-x-4 rtl:group-hover:-translate-x-4 group-hover:-translate-y-4">
          <div className="text-primary-foreground pt-56">
            <JourneyIllustration mirrored={mirrored} />
          </div>
        </div>
      </div>

      <div className="absolute -bottom-24 -inset-s-16 w-80 h-80 pointer-events-none z-0">
        <div className="w-full h-full bg-linear-to-tr from-[color-mix(in_srgb,var(--primary),black_20%)] to-[color-mix(in_srgb,var(--primary),white_30%)] rounded-full transition-transform duration-500 ease-out group-hover:-translate-x-6 rtl:group-hover:translate-x-6 group-hover:-translate-y-4"></div>
      </div>

      <div className="absolute top-[40%] inset-s-[35%] w-64 h-64 -mt-32 pointer-events-none z-0">
        <div className="w-full h-full bg-linear-to-bl from-primary to-[color-mix(in_srgb,var(--primary),black_50%)] shadow-2xl rounded-full transition-transform duration-700 delay-75 ease-out group-hover:-translate-x-8 rtl:group-hover:translate-x-8 group-hover:translate-y-6"></div>
      </div>

      <div className="absolute -bottom-12 -inset-e-12 w-40 h-40 pointer-events-none z-0">
        <div className="w-full h-full bg-linear-to-tl from-[color-mix(in_srgb,var(--primary),white_20%)] to-[color-mix(in_srgb,var(--primary),black_15%)] rounded-full transition-transform duration-500 ease-out group-hover:translate-x-3 rtl:group-hover:-translate-x-3 group-hover:-translate-y-3"></div>
      </div>

      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
