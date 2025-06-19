import { ProcessingStatus } from "../types";

export const getStatusColor = (status: ProcessingStatus): string => {
  switch (status) {
    case ProcessingStatus.UPLOADED:
      return "#3b82f6"; // blue
    case ProcessingStatus.PROCESSING:
      return "#f59e0b"; // amber
    case ProcessingStatus.VALIDATING:
      return "#8b5cf6"; // violet
    case ProcessingStatus.COMPLETED:
      return "#10b981"; // emerald
    case ProcessingStatus.FAILED:
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};

export const getStatusLabel = (status: ProcessingStatus): string => {
  switch (status) {
    case ProcessingStatus.UPLOADED:
      return "Uploaded";
    case ProcessingStatus.PROCESSING:
      return "Processing";
    case ProcessingStatus.VALIDATING:
      return "Validating";
    case ProcessingStatus.COMPLETED:
      return "Completed";
    case ProcessingStatus.FAILED:
      return "Failed";
    default:
      return "Unknown";
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};
