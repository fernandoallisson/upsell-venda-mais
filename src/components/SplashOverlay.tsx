import logoMark from '../assets/logo.png'

type SplashOverlayProps = {
  isVisible: boolean
}

const SplashOverlay = ({ isVisible }: SplashOverlayProps) => {
  if (!isVisible) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 animate-splash-fade-in"
      aria-live="assertive"
      aria-label="Carregando painel"
    >
      {/* Logo animada simulando decolagem do foguete */}
      <img
        src={logoMark}
        alt="Logo Incrível Boost"
        className="w-28 sm:w-36 md:w-44 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] animate-rocket-launch"
      />
    </div>
  )
}

export default SplashOverlay
