import isologoMisionesNacionales from '../../assets/logos/ISOLOGO SOMOS MISIONES NACIONALES.png';

export default function BrandLogo({ className = '', alt = 'Misiones Nacionales', decorative = false }) {
  return (
    <img
      src={isologoMisionesNacionales}
      alt={decorative ? '' : alt}
      aria-hidden={decorative ? 'true' : undefined}
      className={`brand-logo ${className}`.trim()}
    />
  );
}
