import {
  Briefcase,
  Building2,
  CircleCheck,
  CircleHelp,
  CircleX,
  CreditCard,
  Globe,
  GraduationCap,
  HeartHandshake,
  Landmark,
  MapPin,
  MessageCircle,
  Shapes,
  ShoppingBag,
  Smartphone,
  Store,
  Tag,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { PlatformState } from "@/lib/content";
import type { ListingType, PlatformGroup } from "@/lib/taxonomy";

export const typeIcons: Record<ListingType, LucideIcon> = {
  ngo: HeartHandshake,
  company: Building2,
  shop: ShoppingBag,
  place: MapPin,
  brand: Tag,
  government: Landmark,
  school: GraduationCap,
  other: Shapes,
};

export const groupIcons: Record<PlatformGroup, LucideIcon> = {
  website: Globe,
  social: Users,
  messaging: MessageCircle,
  maps: MapPin,
  delivery: Truck,
  payment: CreditCard,
  marketplace: Store,
  apps: Smartphone,
  jobs: Briefcase,
  other: Shapes,
};

const stateIcons: Record<PlatformState, LucideIcon> = {
  available: CircleCheck,
  not_available: CircleX,
  unknown: CircleHelp,
};

const stateColors: Record<PlatformState, string> = {
  available: "text-available",
  not_available: "text-not-available",
  unknown: "text-muted",
};

/** Decorative: always pair with a text label for screen readers. */
export function StateIcon({
  state,
  className = "size-4",
}: {
  state: PlatformState;
  className?: string;
}) {
  const Icon = stateIcons[state];
  return (
    <Icon
      aria-hidden
      className={`${className} shrink-0 ${stateColors[state]}`}
    />
  );
}
