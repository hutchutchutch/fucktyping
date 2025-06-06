import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/components/ui/toast";
import {
  CheckCircle,
  AlertCircle,
  Info,
  X,
} from "lucide-react";

// Usage example:
// const notification = useNotification();
// notification.success("Form saved successfully");
// notification.error("Failed to save form");
// notification.info("Don't forget to publish your form");
// notification.warning("Your subscription is about to expire");

interface NotificationOptions extends Partial<typeof Toast> {
  title?: string;
  icon?: React.ReactNode;
}

export function useNotification() {
  const { toast } = useToast();

  const success = (message: string, options: NotificationOptions = {}) => {
    toast({
      variant: "default",
      title: options.title || "Success",
      description: message,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      ...options,
    });
  };

  const error = (message: string, options: NotificationOptions = {}) => {
    toast({
      variant: "destructive",
      title: options.title || "Error",
      description: message,
      icon: <AlertCircle className="h-5 w-5" />,
      ...options,
    });
  };

  const info = (message: string, options: NotificationOptions = {}) => {
    toast({
      variant: "default",
      title: options.title || "Information",
      description: message,
      icon: <Info className="h-5 w-5 text-blue-500" />,
      ...options,
    });
  };

  const warning = (message: string, options: NotificationOptions = {}) => {
    toast({
      variant: "default",
      title: options.title || "Warning",
      description: message,
      icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
      ...options,
    });
  };

  return {
    success,
    error,
    info,
    warning,
  };
}

export default function Notification() {
  return null; // This component doesn't render anything directly
}