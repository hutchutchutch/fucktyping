import { Card as ShadcnCard, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type CardProps = ComponentProps<typeof ShadcnCard>;
type CardHeaderProps = ComponentProps<typeof CardHeader>;
type CardTitleProps = ComponentProps<typeof CardTitle>;
type CardDescriptionProps = ComponentProps<typeof CardDescription>;
type CardContentProps = ComponentProps<typeof CardContent>;
type CardFooterProps = ComponentProps<typeof CardFooter>;

function Card({ children, className, ...props }: CardProps) {
  return (
    <ShadcnCard className={cn("shadow-md", className)} {...props}>
      {children}
    </ShadcnCard>
  );
}

Card.Header = function CardHeaderComponent({ children, className, ...props }: CardHeaderProps) {
  return <CardHeader className={className} {...props}>{children}</CardHeader>;
};

Card.Title = function CardTitleComponent({ children, className, ...props }: CardTitleProps) {
  return <CardTitle className={className} {...props}>{children}</CardTitle>;
};

Card.Description = function CardDescriptionComponent({ children, className, ...props }: CardDescriptionProps) {
  return <CardDescription className={className} {...props}>{children}</CardDescription>;
};

Card.Content = function CardContentComponent({ children, className, ...props }: CardContentProps) {
  return <CardContent className={cn("pt-6", className)} {...props}>{children}</CardContent>;
};

Card.Footer = function CardFooterComponent({ children, className, ...props }: CardFooterProps) {
  return <CardFooter className={className} {...props}>{children}</CardFooter>;
};

export default Card;