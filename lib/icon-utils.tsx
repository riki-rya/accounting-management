// lib/icon-utils.tsx
import {
  Tag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Smartphone,
  Heart,
  Film,
  Book,
  Shirt,
  Zap,
  Coffee,
  Gift,
  MoreHorizontal,
  PlusCircle,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  'tag': Tag,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'shopping-bag': ShoppingBag,
  'utensils': Utensils,
  'car': Car,
  'home': Home,
  'smartphone': Smartphone,
  'heart': Heart,
  'film': Film,
  'book': Book,
  'shirt': Shirt,
  'zap': Zap,
  'coffee': Coffee,
  'gift': Gift,
  'more-horizontal': MoreHorizontal,
  'plus-circle': PlusCircle,
};

export function getIcon(iconName: string) {
  return iconMap[iconName] || Tag;
}

interface CategoryIconProps {
  icon: string;
  className?: string;
  color?: string;
}

export function CategoryIcon({ icon, className = "w-5 h-5", color }: CategoryIconProps) {
  const IconComponent = getIcon(icon);
  return <IconComponent className={className} style={color ? { color } : undefined} />;
}