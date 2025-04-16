import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { ButtonProps } from "@/components/ui/button";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "default", className, ...props }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        variant={variant}
        className={cn(className)}
        {...props}
      >
        {children}
      </ShadcnButton>
    );
  }
);

Button.displayName = "Button";

export default Button;