import {
  Baby,
  CheckCircle,
  Crown,
  Flame,
  Globe,
  GraduationCap,
  Heart,
  HeartPulse,
  Leaf,
  Medal,
  Megaphone,
  Radio,
  Scale,
  Share2,
  Sparkles,
  Sprout,
  Trophy,
  UserCheck,
  Zap,
} from 'lucide-react';

const iconMap = {
  Baby,
  CheckCircle,
  Crown,
  Flame,
  Globe,
  GraduationCap,
  Heart,
  HeartPulse,
  Leaf,
  Medal,
  Megaphone,
  Radio,
  Scale,
  Share2,
  Sparkles,
  Sprout,
  Trophy,
  UserCheck,
  Zap,
};

/**
 * <LucideIcon name="Flame" size={20} className="text-red-500" />
 */
export function LucideIcon({ name, size = 16, className = '', style = {} }) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} style={style} />;
}
