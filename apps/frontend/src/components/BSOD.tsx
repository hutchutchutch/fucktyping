import React from 'react';

interface BSODProps {
  visible: boolean;
  onClose: () => void;
  errorMessage?: string;
}

export const BSOD: React.FC<BSODProps> = ({ 
  visible, 
  onClose, 
  errorMessage = "A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) + 00010E36. The current application will be terminated." 
}) => {
  if (!visible) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-[#0000AA] text-white font-mono p-10 z-[9999] flex flex-col"
      onClick={onClose}
      style={{ fontFamily: 'Courier New, monospace' }}
    >
      <div className="text-2xl mb-6 font-bold">Windows</div>
      
      <div className="mb-8 text-lg">
        {errorMessage}
      </div>
      
      <div className="mb-8 leading-relaxed">
        * Press any key to terminate the current application.<br /><br />
        * Press CTRL+ALT+DEL to restart your computer. You will<br />
        &nbsp;&nbsp;lose any unsaved information in all applications.
      </div>
      
      <div className="mt-auto text-center text-lg">
        Press any key to continue...
      </div>
    </div>
  );
};
