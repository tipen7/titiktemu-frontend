import { MapPinned } from "lucide-react";

// Shared split-panel shell for Login/SignUp/Lupa Password/Reset Password,
// matching Figma node 15004:8438 ("Login/SignUp Page"). The left panel's
// illustration and decorative blobs are the real exported Figma assets
// (see public/auth/), committed locally since the MCP asset URLs expire.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full bg-neutral-0">
      <div className="relative hidden w-[45%] max-w-[707px] shrink-0 overflow-hidden bg-primary-500 lg:block">
        <img
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-[31%] -top-[34%] w-[165%] max-w-none"
          src="/auth/blob-1.svg"
        />
        <img
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-[3%] top-[24%] w-[120%] max-w-none"
          src="/auth/blob-2.svg"
        />
        <img
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-[16%] -top-[20%] size-[76%] max-w-none"
          src="/auth/ellipse.svg"
        />
        <img
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-[16%] top-[68%] size-[76%] max-w-none"
          src="/auth/ellipse.svg"
        />
        <p className="absolute right-[8%] top-[9%] w-[55%] text-right font-sans text-[30px] leading-[36px] text-neutral-0">
          <span className="font-bold">Temukan</span> lokasi paling potensial
          untuk usaha Anda berkembang tanpa keraguan.
        </p>
        <img
          alt="Ilustrasi Asisten TitikTemu"
          className="absolute left-[10%] top-[24%] w-[68%] max-w-none object-cover"
          src="/auth/login-illustration.png"
        />
        <p className="absolute bottom-[16%] left-[7%] font-sans text-[30px] leading-[36px] text-neutral-0">
          Bersama <span className="text-[48px] font-bold leading-[48px]">TitikTemu.</span>
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16 sm:px-12 lg:px-24">
        <div className="w-full max-w-[445px]">
          <a
            href="/beranda/"
            className="mb-8 flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary-700 text-neutral-0">
              <MapPinned className="size-7" strokeWidth={1.8} />
            </span>
            <span className="font-sans text-h6 font-semibold tracking-tight text-secondary-800">
              TitikTemu
            </span>
          </a>
          {children}
        </div>
      </div>
    </div>
  );
}
