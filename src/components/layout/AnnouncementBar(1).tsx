import Link from "next/link";
import { announcement } from "@/config/site";

export function AnnouncementBar() {
  if (!announcement.enabled || !announcement.message) return null;
  return (
    <div className="relative z-50 border-b border-line/60 bg-obsidian text-center text-[0.8rem] text-muted">
      <p className="frame flex min-h-9 flex-wrap items-center justify-center gap-x-3 py-2">
        <span>{announcement.message}</span>
        {announcement.link && <Link href={announcement.link.href} className="link-underline text-champagne">{announcement.link.label}</Link>}
      </p>
    </div>
  );
}
