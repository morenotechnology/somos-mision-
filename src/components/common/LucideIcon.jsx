import {
  Baby,
  BarChart3,
  BookOpenCheck,
  CheckCircle,
  Crown,
  Flame,
  Globe,
  GraduationCap,
  HandHeart,
  Heart,
  HeartPulse,
  Landmark,
  Leaf,
  Map,
  Medal,
  Megaphone,
  Radio,
  RefreshCw,
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
  BarChart3,
  BookOpenCheck,
  CheckCircle,
  Crown,
  Flame,
  Globe,
  GraduationCap,
  HandHeart,
  Heart,
  HeartPulse,
  Landmark,
  Leaf,
  Map,
  Medal,
  Megaphone,
  Radio,
  RefreshCw,
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
