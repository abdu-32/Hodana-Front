"use client";

import React, { useState, useEffect } from "react";
import {
  AISupportChatModal,
  AIHumanSupportEscalationContext,
} from "@/features/knowledge-base/components/AISupportChatModal";
import { HumanSupportModal } from "@/features/knowledge-base/components/HumanSupportModal";
import { MyTicketsModal } from "@/features/knowledge-base/components/MyTicketsModal";
import { SupportTicket } from "@/features/knowledge-base/api/human-support-api";

export function GlobalSupportAssistant() {
  const [isHumanSupportOpen, setIsHumanSupportOpen] = useState(false);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);
  const [escalationContext, setEscalationContext] = useState<AIHumanSupportEscalationContext | null>(null);

  const handleOpenHumanSupport = (context?: AIHumanSupportEscalationContext) => {
    if (context) {
      setEscalationContext(context);
    } else {
      setEscalationContext(null);
    }
    setIsHumanSupportOpen(true);
  };

  const handleTicketCreated = (_ticket: SupportTicket) => {
    setIsHumanSupportOpen(false);
    setIsMyTicketsOpen(true);
  };

  useEffect(() => {
    const onOpenHumanSupportEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AIHumanSupportEscalationContext | undefined>;
      handleOpenHumanSupport(customEvent.detail);
    };

    const onOpenMyTicketsEvent = () => {
      setIsMyTicketsOpen(true);
    };

    window.addEventListener("open-human-support", onOpenHumanSupportEvent);
    window.addEventListener("open-my-tickets", onOpenMyTicketsEvent);

    return () => {
      window.removeEventListener("open-human-support", onOpenHumanSupportEvent);
      window.removeEventListener("open-my-tickets", onOpenMyTicketsEvent);
    };
  }, []);

  return (
    <>
      <AISupportChatModal
        onOpenHumanSupport={(ctx) => handleOpenHumanSupport(ctx)}
      />

      <HumanSupportModal
        isOpen={isHumanSupportOpen}
        onClose={() => setIsHumanSupportOpen(false)}
        onTicketCreated={handleTicketCreated}
        initialSubject={escalationContext?.subject || ""}
        initialDescription={escalationContext?.description || ""}
        initialOtherDetails={escalationContext?.otherDetails || ""}
      />

      <MyTicketsModal
        isOpen={isMyTicketsOpen}
        onClose={() => setIsMyTicketsOpen(false)}
        onOpenNewTicketModal={() => {
          setIsMyTicketsOpen(false);
          handleOpenHumanSupport();
        }}
      />
    </>
  );
}
