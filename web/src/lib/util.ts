export const pretty = (d: string) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "";

export const todayStr = () => new Date().toLocaleDateString("en-CA");
