import { PropsWithChildren } from "react"

type Props = PropsWithChildren<{
  title: string
  onClose?: () => void
  init: { x: number; y: number }       // starting position
}>

export function RetroWindow({ title, onClose, init, children }: Props) {
  return (
    <div
      className="absolute select-none shadow-md bg-w95-1 bevel-up"
      style={{ top: init.y, left: init.x, width: 320, minHeight: 360 }}
    >
      {/* title bar */}
      <div className="h-6 flex items-center justify-between px-2 bg-w95-2 text-white">
        <span className="truncate">{title}</span>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center bg-w95-0 text-w95-3 bevel-up hover:bevel-down active:bevel-down"
        >
          ✕
        </button>
      </div>

      <div className="p-3 text-w95-3">{children}</div>
    </div>
  )
}
