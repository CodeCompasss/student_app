// @/util/AdminLogEntry
export interface AdminLogEntry {
    step: number; // Represents the step index (0 for Verify, 1 for Select, etc.)
    label: string;
    value: string;
    admin: string;
}
