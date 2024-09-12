import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const carouselVariants = cva("relative", {
  variants: {
    direction: {
      horizontal: "flex",
      vertical: "flex flex-col",
    },
  },
  defaultVariants: {
    direction: "horizontal",
  },
});

type CarouselVariantProps = VariantProps<typeof carouselVariants>;

interface CarouselProps extends CarouselVariantProps {
  children: React.ReactNode;
}

export const Carousel = ({ direction, children }: CarouselProps) => {
  return <div className={cn(carouselVariants({ direction }))}>{children}</div>;
};

const carouselContentVariants = cva(
  "flex space-x-4 items-center justify-center",
  {
    variants: {
      direction: {
        horizontal: "flex",
        vertical: "flex flex-col",
      },
    },
    defaultVariants: {
      direction: "horizontal",
    },
  }
);

type CarouselContentVariantProps = VariantProps<typeof carouselContentVariants>;

interface CarouselContentProps extends CarouselContentVariantProps {
  children: React.ReactNode;
}

export const CarouselContent = ({
  direction,
  children,
}: CarouselContentProps) => {
  return (
    <div className={cn(carouselContentVariants({ direction }))}>{children}</div>
  );
};

const carouselItemVariants = cva("p-2", {
  variants: {
    size: {
      default: "w-32 h-32",
      sm: "w-24 h-24",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type CarouselItemVariantProps = VariantProps<typeof carouselItemVariants>;

interface CarouselItemProps extends CarouselItemVariantProps {
  children: React.ReactNode;
}

export const CarouselItem = ({ size, children }: CarouselItemProps) => {
  return <div className={cn(carouselItemVariants({ size }))}>{children}</div>;
};

const carouselButtonVariants = cva(
  "absolute top-1/2 transform -translate-y-1/2 cursor-pointer",
  {
    variants: {
      direction: {
        left: "left-0",
        right: "right-0",
      },
    },
    defaultVariants: {
      direction: "right",
    },
  }
);

type CarouselButtonVariantProps = VariantProps<typeof carouselButtonVariants>;

interface CarouselButtonProps extends CarouselButtonVariantProps {
  onClick: () => void;
}

export const CarouselPrevious = ({
  onClick,
  direction,
}: CarouselButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(carouselButtonVariants({ direction }))}
    >
      Previous
    </button>
  );
};

export const CarouselNext = ({ onClick, direction }: CarouselButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(carouselButtonVariants({ direction }))}
    >
      Next
    </button>
  );
};
