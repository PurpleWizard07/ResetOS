import {
  Briefcase,
  Building2,
  CalendarClock,
  Code2,
  Dumbbell,
  Files,
  HeartPulse,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Moon,
  Network,
  NotebookPen,
  Pill,
  Scale,
  ShieldCheck,
  Sparkles,
  Droplet,
  BookOpen,
} from "lucide-react";

/**
 * Single source of truth for every navigable section — Sidebar.jsx renders
 * from this, and CommandPalette.jsx searches it, so the icon/label/grouping
 * for a section is never defined in two places that could drift apart.
 *
 * `group` is null for top-level items (Dashboard, Strength, Journal); the two
 * named groups become a collapsible NavGroup in the sidebar and a labeled
 * section in the command palette.
 */
export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: null },
  { id: "todo", label: "To-Do", icon: ListTodo, group: null },
  { id: "schedule", label: "Schedule", icon: CalendarClock, group: null },
  { id: "water", label: "Water", icon: Droplet, group: "Wellness" },
  { id: "weight", label: "Weight", icon: Scale, group: "Wellness" },
  { id: "sleep", label: "Sleep", icon: Moon, group: "Wellness" },
  { id: "cracker", label: "Cracker", icon: ShieldCheck, group: "Wellness" },
  { id: "vitamin", label: "Vitamins", icon: Pill, group: "Wellness" },
  { id: "skin", label: "Skin", icon: Sparkles, group: "Wellness" },
  { id: "strength", label: "Strength", icon: Dumbbell, group: null },
  { id: "dsa", label: "DSA", icon: Code2, group: "40+ LPA" },
  { id: "fundamentals", label: "Fundamentals", icon: BookOpen, group: "40+ LPA" },
  { id: "systemdesign", label: "System Design", icon: Network, group: "40+ LPA" },
  { id: "misc", label: "Miscellaneous", icon: Files, group: "40+ LPA" },
  { id: "interview", label: "Interview", icon: MessageSquare, group: "40+ LPA" },
  { id: "companies", label: "Companies", icon: Building2, group: "40+ LPA" },
  { id: "journal", label: "Journal", icon: NotebookPen, group: null },
];

/** Icon + accent color for each collapsible group header. */
export const NAV_GROUPS = {
  Wellness: { icon: HeartPulse },
  "40+ LPA": { icon: Briefcase },
};

export const WELLNESS_VIEWS = NAV_ITEMS.filter((n) => n.group === "Wellness").map((n) => n.id);
export const PREP_VIEWS = NAV_ITEMS.filter((n) => n.group === "40+ LPA").map((n) => n.id);
