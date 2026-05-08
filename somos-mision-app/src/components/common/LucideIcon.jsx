// Dynamic Lucide icon renderer — pass icon name as string
import * as LucideIcons from 'lucide-react';

/**
 * <LucideIcon name="Flame" size={20} className="text-red-500" />
 */
export function LucideIcon({ name, size = 16, className = '', style = {} }) {
  const Icon = LucideIcons[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} style={style} />;
}
