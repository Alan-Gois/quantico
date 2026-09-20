import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  status?: "success" | "warning" | "error" | "neutral";
  icon?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = "",
  description = "",
  status = "neutral",
  icon,
}) => {
  const statusColors = {
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    error: "bg-red-50 border-red-200",
    neutral: "bg-blue-50 border-blue-200",
  };

  const statusTextColors = {
    success: "text-green-700",
    warning: "text-yellow-700",
    error: "text-red-700",
    neutral: "text-blue-700",
  };

  const statusIconColors = {
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
    neutral: "text-blue-500",
  };

  return (
    <div
      className={`p-4 rounded-lg border ${statusColors[status]} flex flex-col gap-2`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {icon && <span className={statusIconColors[status]}>{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${statusTextColors[status]}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-gray-600">{unit}</span>}
      </div>

      {description && <p className="text-xs text-gray-600">{description}</p>}
    </div>
  );
};

export default MetricCard;
