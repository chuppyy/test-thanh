import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  fluid?: boolean;
};

export const Container = ({
  children,
  className = "",
  fluid = false,
}: ContainerProps) => {
  const baseClasses = fluid
    ? "max-w-[600px] mx-auto px-4 sm:px-0"
    : "container mx-auto px-4 sm:px-6 lg:px-8";

  return <div className={`${baseClasses} ${className}`}>{children}</div>;
};
