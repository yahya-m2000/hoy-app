// Message utilities
export const isMessageRecent = (timestamp: Date, hours: number = 24): boolean => {
  const now = new Date();
  const timeDiff = now.getTime() - timestamp.getTime();
  return timeDiff < (hours * 60 * 60 * 1000);
};