import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Button, type ButtonProps } from "./ui/button";

interface LinkButtonProps extends ButtonProps {
  to: string
}

export function LinkButton({ to, children, ...props }: LinkButtonProps) {
  return (
    <Button
      asChild
      {...props}
    >
      <Link to={to}>
        {children}
      </Link>
    </Button>
  )
}

const GoBackButton = ({ children, ...props}: LinkButtonProps) => {
  return (
    <LinkButton variant="link" {...props}>
      <ArrowLeft /> {children}
    </LinkButton>
  )
}

export { GoBackButton }