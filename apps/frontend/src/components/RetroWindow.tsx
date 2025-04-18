import { Close } from "@react95/icons";
import { PropsWithChildren } from "react";

type RetroWindowProps = PropsWithChildren<{ title: string; onClose?: () => void }>;

export const RetroWindow = ({ title, onClose, children }: RetroWindowProps) => (
  <div className="bg-bg border border-border-dark shadow-lg m-4">
    <div className="bg-primary text-primary-contrast px-2 py-1 flex justify-between items-center">
      <span>{title}</span>
      <button 
        className="bg-bg text-fg px-1 text-xs"
        onClick={onClose}
      >
        <Close variant="16x16_4" />
      </button>
    </div>

    {/* Optional button bar */}
    <div className="px-2 py-1 space-x-2 bg-bg border-t border-border-light">
      <button className="bg-bg border border-border-dark px-2 py-1 text-sm">Submit</button>
      <button className="bg-bg border border-border-dark px-2 py-1 text-sm">Cancel</button>
    </div>

    <div className="p-4 bg-bg text-fg border border-border-dark m-1">
      {children}
    </div>
  </div>
);
