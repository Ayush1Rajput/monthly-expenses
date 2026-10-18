import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Shirt,
  Tv,
  Zap,
  Car,
  HeartPulse,
  Sparkles,
  GraduationCap,
  MoreHorizontal
} from 'lucide-react';
import { getCategoryMeta } from '../utils/categories';

const iconComponents = {
  Utensils,
  ShoppingBag,
  Shirt,
  Tv,
  Zap,
  Car,
  HeartPulse,
  Sparkles,
  GraduationCap,
  MoreHorizontal
};

export default function CategoryIcon({ category, size = 18, className = '' }) {
  const meta = getCategoryMeta(category);
  const IconComponent = iconComponents[meta.icon] || MoreHorizontal;

  return (
    <div
      className={`flex items-center justify-center rounded-xl p-2.5 transition-all ${meta.bg} ${meta.text} ${className}`}
      style={{ color: meta.color }}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
}
