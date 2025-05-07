import { Check, Loader2, X } from "lucide-react";

export function Transaction({
  label,
  createdAt,
  status,
  amount,
  statusText,
}: {
  label: string;
  createdAt: string | Date;
  status: "pending" | "failed" | "completed";
  statusText: string;
  amount: number;
}) {
  const formattedDate = new Date(createdAt).toLocaleDateString();

  const getStatusIcon = () => {
    if (status === "completed") {
      return <Check className="text-white" />;
    } else if (status === "failed") {
      return <X className="text-white" />;
    } else {
      return <Loader2 className="animate-spin" />;
    }
  };

  const getStatusColor = () => {
    if (status === "completed") {
      return "bg-[#76AD10]";
    } else if (status === "failed") {
      return "bg-[#E74C3C]";
    } else {
      return "bg-[#F5A623]";
    }
  };

  return (
    <div className="flex items-center justify-between rounded-full border border-[#3A3A3A] bg-[#2A2A2A] p-3 pr-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusColor()}`}
        >
          {getStatusIcon()}
        </div>
        <div className="flex flex-col">
          <span className="font-manrope text-sm font-medium">{label}</span>
          <span className="font-manrope text-xs text-[#93A179]">{formattedDate}</span>
        </div>
      </div>
      <div className="font-manrope text-right">
        <div className="text-sm font-semibold">
          {amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FRU
        </div>
        <div className="text-xs text-[#93A179]">{statusText}</div>
      </div>
    </div>
  );
}
