import { Coffee, UtensilsCrossed, Shirt, Sparkles, FlaskConical, Gem, Cpu, Leaf, Dumbbell, Building2, Landmark, GraduationCap, Plane, PenTool, ShoppingBag, Circle } from 'lucide-react';

const MAP = { Coffee, UtensilsCrossed, Shirt, Sparkles, FlaskConical, Gem, Cpu, Leaf, Dumbbell, Building2, Landmark, GraduationCap, Plane, PenTool, ShoppingBag };

export default function Icon({ name, ...props }) {
  const C = MAP[name] || Circle;
  return <C {...props} />;
}
