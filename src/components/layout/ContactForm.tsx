"use client";

import { Info, Loader2, Mail, User } from "lucide-react";
import { useState } from "react";

import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import type { FieldErrors } from "@/lib/auth/types";
import { isClean, validateEmail, validateName } from "@/lib/auth/validation";

const topics = [
  { value: "support", label: "Help with the app" },
  { value: "coaching", label: "Coaching enquiry" },
  { value: "billing", label: "Billing and plans" },
  { value: "feedback", label: "Product feedback" },
];

/** Contact form. Validated and complete, but sending is not connected. */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(topics[0].value);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const { notify } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      message: message.trim().length < 10 ? "Tell us a little more (10+ characters)" : undefined,
    };
    setErrors(nextErrors);
    if (!isClean(nextErrors)) return;

    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setPending(false);

    notify({
      tone: "info",
      title: "Messaging isn't connected yet",
      description: "Your message was not sent or stored. Email is wired up with the backend.",
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Name"
          value={name}
          onChange={setName}
          autoComplete="name"
          icon={User}
          error={errors.name}
          disabled={pending}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          icon={Mail}
          error={errors.email}
          disabled={pending}
        />
      </div>

      <SelectField label="Topic" value={topic} onChange={setTopic} options={topics} />

      <div>
        <label
          htmlFor="contact-message"
          className="text-fog block text-[10px] font-semibold tracking-[0.2em] uppercase"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          disabled={pending}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`bg-ink-850 text-chalk placeholder:text-fog/70 focus-visible:outline-accent-500 mt-2.5 w-full resize-y rounded-xl border p-4 text-sm transition-colors duration-200  focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${
            errors.message
              ? "border-red-500/50"
              : "border-chalk/10 hover:border-chalk/20 focus:border-accent-500/60"
          }`}
          placeholder="What can we help with?"
        />
        {errors.message ? (
          <p id="contact-message-error" className="mt-2 text-xs text-red-400">
            {errors.message}
          </p>
        ) : null}
      </div>

      <p className="text-fog border-chalk/10 bg-chalk/[0.03] flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs leading-relaxed">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Messaging is not connected yet, so nothing you send here will reach us or be
          stored.
        </span>
      </p>

      <button
        type="submit"
        disabled={pending}
        className="bg-accent-500 hover:bg-accent-400 active:bg-accent-600 shadow-glow inline-flex h-12 items-center justify-center gap-2.5 rounded-xl text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60 sm:w-fit sm:px-8"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        Send Message
      </button>
    </form>
  );
}
