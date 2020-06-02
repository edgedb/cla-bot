// Common code to format dates for the client

const supportedFormats: { [key: string]: Intl.DateTimeFormat } = {
  "en-us": new Intl.DateTimeFormat("en-us", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }),
  "en-gb": new Intl.DateTimeFormat("en-gb", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
}


function getCurrentFormat(): Intl.DateTimeFormat {
  const preferredDateCulture = localStorage.getItem("") || "en-us";
  return supportedFormats[preferredDateCulture] || supportedFormats["en-us"];
}


export default function formatDate(date: Date | string): string {
  const value = date instanceof Date ? date : new Date(date);
  return getCurrentFormat().format(value)
}
