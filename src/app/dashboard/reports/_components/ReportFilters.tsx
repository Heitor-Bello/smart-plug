export type Range = "24h" | "7d" | "30d";

interface Device {
  id: string;
  name: string;
}

interface ReportFiltersProps {
  devices: Device[];
  deviceId: string;
  range: Range;
  onDeviceChange: (deviceId: string) => void;
  onRangeChange: (range: Range) => void;
}

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
];

export function ReportFilters({
  devices,
  deviceId,
  range,
  onDeviceChange,
  onRangeChange,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <select
        value={deviceId}
        onChange={(e) => onDeviceChange(e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
      >
        <option value="all">Todos os dispositivos</option>
        {devices.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <div className="flex rounded-lg border border-border bg-card p-1">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onRangeChange(opt.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              range === opt.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
