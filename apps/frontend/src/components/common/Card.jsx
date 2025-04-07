import { Card as ShadcnCard, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@ui/card";
import { cn } from "@lib/utils";

function Card({ children, className, ...props }) {
  return (
    <ShadcnCard className={cn("shadow-md", className)} {...props}>
      {children}
    </ShadcnCard>
  );
}

Card.Header = function CardHeaderComponent({ children, className, ...props }) {
  return <CardHeader className={className} {...props}>{children}</CardHeader>;
};

Card.Title = function CardTitleComponent({ children, className, ...props }) {
  return <CardTitle className={className} {...props}>{children}</CardTitle>;
};

Card.Description = function CardDescriptionComponent({ children, className, ...props }) {
  return <CardDescription className={className} {...props}>{children}</CardDescription>;
};

Card.Content = function CardContentComponent({ children, className, ...props }) {
  return <CardContent className={cn("pt-6", className)} {...props}>{children}</CardContent>;
};

Card.Footer = function CardFooterComponent({ children, className, ...props }) {
  return <CardFooter className={className} {...props}>{children}</CardFooter>;
};

export default Card;
