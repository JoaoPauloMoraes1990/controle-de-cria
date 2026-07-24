export function MarcaDaguaLogo() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt=""
      aria-hidden="true"
      className="pointer-events-none fixed left-1/2 top-1/2 -z-10 h-[62vmin] w-[62vmin] -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.16]"
    />
  )
}
