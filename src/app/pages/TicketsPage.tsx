import React from "react";
import { EventsSection } from '../components/EventsSection';
import { TicketsSection } from '../components/TicketsSection';

export function TicketsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Events from the database */}
      <EventsSection />

      {/* Ticket reservation info and vouchers */}
      <TicketsSection />
    </div>
  );
}
