import { Button as ShadcnButton } from "@ui/button";
import { cn } from "@lib/utils";
import { forwardRef } from "react";

const Button = forwardRef(
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
