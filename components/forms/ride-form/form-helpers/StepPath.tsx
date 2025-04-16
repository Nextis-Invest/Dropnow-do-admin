"use client";

import React from "react";
import {
  CarIcon,
  CalendarIcon,
  BuildingIcon,
  UserIcon,
  MapPinIcon,
  BriefcaseIcon,
  CheckCircleIcon,
} from "lucide-react";
import { MilestoneIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  label: string;
}

interface StepPathProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export const StepPath: React.FC<StepPathProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  // Get the appropriate icon for each step
  const getStepIcon = (
    stepId: string,
    isActive: boolean,
    isCompleted: boolean
  ) => {
    const commonClasses = cn(
      "h-5 w-5",
      isActive
        ? "text-primary"
        : isCompleted
        ? "text-primary/70"
        : "text-muted-foreground/50"
    );

    switch (stepId) {
      case "ride-type":
        return <CarIcon className={commonClasses} />;
      case "event":
        return <CalendarIcon className={commonClasses} />;
      case "client":
        return <BuildingIcon className={commonClasses} />;
      case "passenger":
        return <UserIcon className={commonClasses} />;
      case "location-details":
        return <MapPinIcon className={commonClasses} />;
      case "milestones":
        return <MilestoneIcon className={commonClasses} />;
      case "mission":
        return <BriefcaseIcon className={commonClasses} />;
      case "review":
        return <CheckCircleIcon className={commonClasses} />;
      default:
        return <CheckCircleIcon className={commonClasses} />;
    }
  };

  return (
    <div className="mb-8">
      {/* Desktop View - Horizontal Steps */}
      <div className="hidden md:flex items-center w-full">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable =
            onStepClick && (isCompleted || index === currentStep);

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div
                className={cn(
                  "flex flex-col items-center relative group",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => isClickable && onStepClick(index)}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                    isActive
                      ? "border-primary bg-primary/10"
                      : isCompleted
                      ? "border-primary/70 bg-primary/5"
                      : "border-muted-foreground/30 bg-background"
                  )}
                >
                  {getStepIcon(step.id, isActive, isCompleted)}
                </div>

                {/* Step Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-primary/70"
                      : "text-muted-foreground/70"
                  )}
                >
                  {step.label}
                </span>

                {/* Tooltip for clickable steps */}
                {isClickable && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background border border-border rounded px-2 py-1 text-xs shadow-sm pointer-events-none">
                    {isCompleted ? "Go back to this step" : "Current step"}
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 ease-in-out",
                      index < currentStep
                        ? "bg-primary/70"
                        : "bg-muted-foreground/30"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile View - Compact Steps */}
      <div className="flex md:hidden flex-col w-full">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isClickable =
              onStepClick && (isCompleted || index === currentStep);

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                  isClickable ? "cursor-pointer" : "cursor-default",
                  isActive
                    ? "border-primary bg-primary/10"
                    : isCompleted
                    ? "border-primary/70 bg-primary/5"
                    : "border-muted-foreground/30 bg-background"
                )}
                onClick={() => isClickable && onStepClick(index)}
              >
                {getStepIcon(step.id, isActive, isCompleted)}
              </div>
            );
          })}
        </div>

        {/* Current Step Label */}
        <div className="text-center text-sm font-medium text-primary mt-1">
          {steps[currentStep]?.label || ""}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-muted-foreground/20 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
