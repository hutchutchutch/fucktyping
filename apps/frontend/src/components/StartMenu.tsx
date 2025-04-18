import React from 'react';

interface StartMenuItem {
  label?: string;
  icon?: string;
  onClick?: () => void;
  divider?: boolean;
}

interface StartMenuProps {
  visible: boolean;
  onClose: () => void;
  items?: StartMenuItem[];
}

export const StartMenu: React.FC<StartMenuProps> = ({ 
  visible, 
  onClose,
  items = [
    { label: 'Get Started', icon: '/start-icon.png', onClick: () => console.log('Get Started clicked') },
    { label: 'Form Builder', icon: '/form-icon.png', onClick: () => console.log('Form Builder clicked') },
    { divider: true },
    { label: 'Settings', icon: '/settings-icon.png', onClick: () => console.log('Settings clicked') },
    { label: 'Help', icon: '/help-icon.png', onClick: () => console.log('Help clicked') },
    { divider: true },
    { label: 'Shut Down...', onClick: () => console.log('Shut Down clicked') },
  ]
}) => {
  if (!visible) return null;
  
  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);
  
  // Prevent clicks inside the menu from closing it
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className="absolute bottom-10 left-0 w-64 bg-[#C0C0C0] border-t-2 border-l-2 border-[#FFFFFF] border-b-2 border-r-2 border-[#404040] shadow-md z-50"
      onClick={handleMenuClick}
    >
      {/* Windows 98 Start Menu Header */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] h-16 flex items-center p-2">
        <div className="text-white font-bold text-2xl transform -rotate-90 origin-left ml-2 font-w98">
          Voice Form
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="p-1">
        {items.map((item, index) => (
          item.divider ? (
            <div key={`divider-${index}`} className="border-t border-[#808080] border-b border-[#FFFFFF] my-1" />
          ) : (
            <div
              key={`item-${index}`}
              className="w-full text-left px-2 py-1 flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer"
              onClick={item.onClick}
            >
              {item.icon && <img src={item.icon} alt="" className="w-4 h-4" />}
              <span className="font-w98 text-sm">{item.label}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};
