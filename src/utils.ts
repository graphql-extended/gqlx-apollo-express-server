export function tryParseJson(message?: string) {
  if (message) {
    try {
      return JSON.parse(message);
    } catch (_) {}
  }

  return message;
}
