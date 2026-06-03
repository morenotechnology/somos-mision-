export default function BrandLogo({ className = '', alt = 'Somos Misión Colombia', decorative = false }) {
  return (
    <img
      src="/isologo-somos-mision.svg"
      alt={decorative ? '' : alt}
      aria-hidden={decorative ? 'true' : undefined}
      className={`brand-logo ${className}`.trim()}
    />
  );
}
