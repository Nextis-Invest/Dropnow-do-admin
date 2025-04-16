"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface StepHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  title,
  description,
  icon,
  className,
}) => {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground ml-[52px]">{description}</p>
      )}
    </div>
  );
};
