import { PropsWithChildren } from "react"
import { WindowControls } from "./WindowControls"

export type Props = PropsWithChildren<{
  title: string
  icon?: string
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  init: { x: number; y: number }       // starting position
  width?: number
  height?: number
  // Props for drag handling
  dragHandleRef?: React.Ref<HTMLDivElement>
  dragHandleListeners?: Record<string, any>
  dragHandleAttributes?: Record<string, any>
}>

export function RetroWindow({ 
  title, 
  icon, 
  onClose, 
  onMinimize, 
  onMaximize, 
  init, 
  width = 320, 
  height = 360, 
  children,
  dragHandleRef,
  dragHandleListeners,
  dragHandleAttributes
}: Props) {
  return (
    <div
      className="absolute select-none w98-window shadow-md"
      style={{ 
        top: init.y, 
        left: init.x, 
        width: width, 
        minHeight: height,
        cursor: 'var(--cursor-default)',
        boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* title bar */}
      <div 
        className="w98-titlebar flex items-center justify-between gap-2"
        ref={dragHandleRef}
        {...dragHandleListeners}
        {...dragHandleAttributes}
      >
        {/* Container for icon and title - allows truncation */}
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden mr-6">
          {icon && <img src={icon} alt="" className="w-4 h-4 flex-shrink-0" />}
          <span className="truncate font-w98 text-sm font-bold text-white select-none">{title}</span>
        </div>
        {/* Controls are pushed to the right by justify-between */}
        <WindowControls 
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
        />
      </div>

      <div className="p-3 text-w95-3 font-w98">{children}</div>
    </div>
  )
}
