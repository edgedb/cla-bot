// Common code to format dates for the client
// Note: here EN-US culture is used;
//
// TODO: let the user configure the preferred culture for dates
//

const dateTimeFormat = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
})

export default function formatDate(date: Date | string): string {
  const value = date instanceof Date ? date : new Date(date);
  return dateTimeFormat.format(value)
}
