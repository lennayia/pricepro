/**
 * Centrální mapování ikon pro celou aplikaci
 * Používáme Lucide React pro konzistentní design
 */

import {
  MessageCircle,
  Camera,
  Smartphone,
  FileText,
  Mail,
  GraduationCap,
  Briefcase,
  Coffee,
  Moon,
  Users,
  Sparkles,
  ArrowLeft,
  Save,
  CheckCircle2,
  Circle,
  BarChart3,
  Clock,
} from 'lucide-react';

// Ikony pro kategorie aktivit
export const CATEGORY_ICONS = {
  // Pracovní aktivity
  client_communication: MessageCircle,
  content_creation: Camera,
  social_media: Smartphone,
  administration: FileText,
  messages: Mail,
  education: GraduationCap,
  billable_work: Briefcase,
  other: Coffee,

  // Osobní život
  sleep: Moon,
  family_time: Users,
  personal_time: Sparkles,
};

// Ikony pro UI akce
export const UI_ICONS = {
  back: ArrowLeft,
  save: Save,
  completed: CheckCircle2,
  incomplete: Circle,
  results: BarChart3,
  clock: Clock,
};

// Export všech ikon pro snadný přístup
export const ICONS = {
  ...CATEGORY_ICONS,
  ...UI_ICONS,
};

// Helper pro získání ikony komponenty
export const getIcon = (iconKey) => {
  return ICONS[iconKey] || Coffee; // Coffee jako fallback
};
