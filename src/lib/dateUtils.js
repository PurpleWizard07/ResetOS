export const toDay = () => new Date().toISOString().split("T")[0];

export const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

export const fmt = (d) =>
  new Date(d + "T00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const fmtLong = (d) =>
  new Date(d + "T00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

export const nowT = () => new Date().toTimeString().slice(0, 5);

export const shiftDate = (dStr, delta) => {
  const d = new Date(dStr + "T00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().split("T")[0];
};

export const iD = (n) => Date.now() - n * 1000;

export const getDayName = (n) =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][n];

export const calcStreak = (dates) => {
  if (!dates.length) return 0;
  const unique = [...new Set(dates)].sort().reverse();
  const todayD = new Date();
  todayD.setHours(0, 0, 0, 0);
  const diffFirst = Math.floor(
    (todayD - new Date(unique[0] + "T00:00:00")) / 86400000
  );
  if (diffFirst > 1) return 0;
  let streak = 0,
    exp = diffFirst;
  for (let d of unique) {
    const diff = Math.floor(
      (todayD - new Date(d + "T00:00:00")) / 86400000
    );
    if (diff === exp) {
      streak++;
      exp++;
    } else break;
  }
  return streak;
};

