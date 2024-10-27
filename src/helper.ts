export const fahrenheatToCelsius = (temp: number | undefined) => {
  if (!temp) return;
  return ((temp - 32) * (5 / 9)).toFixed(2);
};

export const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};
