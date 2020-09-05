const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

export function formatBytes(bytes: number, decimals: number = 0): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals || 2;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
