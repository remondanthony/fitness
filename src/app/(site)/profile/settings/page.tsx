import { Info } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { ToggleGroup } from "@/components/settings/ToggleGroup";
import {
  notificationSettings,
  privacySettings,
  settingsSections,
} from "@/data/profile";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account, training preferences, notifications and privacy.",
};

export default function SettingsPage() {
  const [account, preferences, notifications, privacy] = settingsSections;

  return (
    <section className="py-10 lg:py-14">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Profile", href: "/profile" },
            { label: "Settings" },
          ]}
        />

        <div className="mt-8">
          <h1 className="font-display text-chalk text-5xl sm:text-6xl">Settings.</h1>
          <p className="text-mist mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
            Everything about how your account works and what we send you.
          </p>
        </div>

        <p className="text-fog border-chalk/10 bg-chalk/[0.03] mt-8 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs leading-relaxed">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            Accounts are not connected yet, so changes on this page are held in the browser
            and reset on reload.
          </span>
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Section nav */}
          <nav aria-label="Settings sections" className="lg:col-span-3">
            <ul className="lg:sticky lg:top-24 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {settingsSections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={`#${section.id}`}
                    className="text-mist hover:bg-chalk/5 hover:text-chalk flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
                  >
                    <section.icon
                      className="text-fog h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sections */}
          <div className="flex flex-col gap-6 lg:col-span-9">
            <SettingsSection
              id={account.id}
              title={account.label}
              description={account.description}
              icon={account.icon}
            >
              <AccountSettings />
            </SettingsSection>

            <SettingsSection
              id={preferences.id}
              title={preferences.label}
              description={preferences.description}
              icon={preferences.icon}
            >
              <PreferencesSettings />
            </SettingsSection>

            <SettingsSection
              id={notifications.id}
              title={notifications.label}
              description={notifications.description}
              icon={notifications.icon}
            >
              <ToggleGroup settings={notificationSettings} />
            </SettingsSection>

            <SettingsSection
              id={privacy.id}
              title={privacy.label}
              description={privacy.description}
              icon={privacy.icon}
            >
              <ToggleGroup settings={privacySettings} />
            </SettingsSection>
          </div>
        </div>
      </Container>
    </section>
  );
}
