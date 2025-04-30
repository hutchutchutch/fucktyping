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
import { ComponentProps } from "react";
import { ButtonProps } from "@/components/ui/button";

interface ModalProps extends ComponentProps<typeof Dialog> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
}

interface ModalFooterProps {
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmVariant?: ButtonProps["variant"];
}

function Modal({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  children, 
  footer,
  className, 
  ...props 
}: ModalProps & { children?: React.ReactNode }) {
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
}: ModalFooterProps & ComponentProps<typeof DialogFooter>) {
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