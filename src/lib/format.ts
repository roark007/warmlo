export function formatDataUpdated(dataUpdated: string): string {
  const [year, month] = dataUpdated.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
