import { Quote } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import type { Testimonial } from "@/data/coaching";

/** A member quote with the context it came from. */
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card tone="raised" className="flex h-full flex-col p-6 sm:p-7">
      <Quote
        className="text-accent-500/50 h-6 w-6 shrink-0 rotate-180"
        aria-hidden="true"
      />

      <blockquote className="text-mist mt-5 flex-1 text-sm leading-relaxed">
        {testimonial.quote}
      </blockquote>

      <footer className="border-chalk/8 mt-6 flex items-center justify-between gap-3 border-t pt-5">
        <div>
          <p className="text-chalk text-sm font-semibold">{testimonial.name}</p>
          <p className="text-fog mt-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
            {testimonial.context}
          </p>
        </div>
        <StarRating value={testimonial.rating} />
      </footer>
    </Card>
  );
}
