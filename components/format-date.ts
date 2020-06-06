// Common code to format dates for the client

// Nota bene: localStorage here works because this function is always
// executed on the client.
// Because the application is designed to fetch all information from API
// from the client, before displaying them on page.

const supportedFormats: {[key: string]: Intl.DateTimeFormat} = {
  "en-us": new Intl.DateTimeFormat("en-us", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
  "en-gb": new Intl.DateTimeFormat("en-gb", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
};

function getCurrentFormat(): Intl.DateTimeFormat {
  const preferredDateCulture =
    localStorage.getItem("DATES_CULTURE") || "en-us";
  return supportedFormats[preferredDateCulture] || supportedFormats["en-us"];
}

export default function formatDate(date: Date | string): string {
  const value = date instanceof Date ? date : new Date(date);
  return getCurrentFormat().format(value);
}
