"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CONTACT_EMAIL, INSTAGRAM_URL, TIKTOK_URL } from "@/lib/config";
import { InstagramIcon, TikTokIcon } from "./SocialIcons";

export function FollowSection() {
  return (
    <section className="border-t border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)] py-14 sm:py-16">
      <Container className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--color-brand-primary)] sm:text-3xl">
            Följ Collaktiv
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
            Håll koll på resan – följ oss för uppdateringar, erbjudanden och
            tips om hållbart resande.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              className="w-full sm:w-auto"
              icon={<InstagramIcon />}
              iconPosition="left"
            >
              Följ på Instagram
            </Button>
            <Button
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              className="w-full sm:w-auto"
              icon={<TikTokIcon />}
              iconPosition="left"
            >
              Följ på TikTok
            </Button>
            <Button
              href={`mailto:${CONTACT_EMAIL}`}
              variant="outline"
              className="w-full sm:w-auto"
              icon={<Mail className="h-4 w-4" />}
              iconPosition="left"
            >
              Maila oss
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
