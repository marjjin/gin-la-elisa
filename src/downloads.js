export function downloadFile(text, filename, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function addToCalendar(event) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gin La Elisa//Demo//ES",
    "BEGIN:VEVENT",
    `UID:demo-${event.id}@ginlaelisa.example`,
    "DTSTAMP:20261106T120000Z",
    `DTSTART:${event.start}`,
    `DTEND:${event.end}`,
    `SUMMARY:[EJEMPLO] ${event.title}`,
    `LOCATION:${event.place} (ubicación ficticia)`,
    "DESCRIPTION:Evento ficticio creado para mostrar el diseño de Gin La Elisa. No es una convocatoria real.",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  downloadFile(
    lines.join("\r\n"),
    `la-elisa-evento-ejemplo-${event.id}.ics`,
    "text/calendar;charset=utf-8",
  );
}
