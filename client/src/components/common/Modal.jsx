import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Button from "./Button";
import { cn } from "@/lib/utils";

function Modal({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  children, 
  footer,
  className, 
  ...props 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

Modal.Footer = function ModalFooter({ 
  cancelText = "Cancel", 
  confirmText = "Save",
  onCancel,
  onConfirm,
  confirmDisabled = false,
  confirmVariant = "default",
  ...props 
}) {
  return (
    <DialogFooter className="gap-2 sm:gap-0" {...props}>
      <DialogClose asChild>
        <Button variant="outline" onClick={onCancel}>
          {cancelText}
        </Button>
      </DialogClose>
      <Button 
        variant={confirmVariant} 
        onClick={onConfirm}
        disabled={confirmDisabled}
      >
        {confirmText}
      </Button>
    </DialogFooter>
  );
};

export default Modal;
