"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarView(props: {
  onDateClick: (dateStr: string) => void;
}) {
  const { onDateClick } = props;

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      height="auto"
      dateClick={(arg) => onDateClick(arg.dateStr)}
    />
  );
}
