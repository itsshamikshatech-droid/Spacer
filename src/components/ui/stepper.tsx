
"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"

interface StepperContextValue extends StepperProps {
  clickable?: boolean
  isError?: boolean
  isLoading?: boolean
  isVertical?: boolean
  stepCount?: number
  expandVerticalSteps?: boolean
  activeStep: number
  initialStep: number
}

const StepperContext = React.createContext<StepperContextValue | null>(null)

function useStepper() {
  const context = React.useContext(StepperContext)

  if (!context) {
    throw new Error("useStepper must be used within a <Stepper />")
  }

  return context
}

interface StepContextValue {
  isLastStep?: boolean
  isCurrentStep?: boolean
  isCompletedStep?: boolean
  isError?: boolean
  isLoading?: boolean
  step: number
  label?: string | React.ReactNode
  description?: string | React.ReactNode
  icon?: React.ReactNode
  hasVisited: boolean
}

const StepContext = React.createContext<StepContextValue | null>(null)

function useStep() {
  const context = React.useContext(StepContext)

  if (!context) {
    throw new Error("useStep must be used within a <Step />")
  }

  return context
}

type StepperProps = {
  className?: string
  children?: React.ReactNode
  orientation?: "vertical" | "horizontal"
  initialStep: number
  state?: "loading" | "error"
  responsive?: boolean
  checkIcon?: React.ReactNode
  errorIcon?: React.ReactNode
  onClickStep?: (step: number, setStep: (step: number) => void) => void
  mobileBreakpoint?: number
  variant?: "circle" | "circle-alt" | "line"
  expandVerticalSteps?: boolean
  styles?: {
    /** Styles for the main stepper container */
    "main-container"?: string
    /** Styles for the horizontal stepper container */
    "horizontal-steps"?: string
    /** Styles for the vertical stepper container */
    "vertical-steps"?: string
    /** Styles for the horizontal step container */
    "horizontal-step"?: string
    /** Styles for the vertical step container */
    "vertical-step"?: string
    /** Styles for the vertical step container */
    "vertical-step-container"?: string
    /** Styles for the horizontal step */
    "horizontal-step-container"?: string
    /** Styles for the step icon container */
    "step-icon-container"?: string
    /** Styles for the step label */
    "step-label"?: string
    /** Styles for the step description */
    "step-description"?: string
    /** Styles for the step connector */
    "step-connector"?: string
  }
  variables?: {
    "--step-color"?: string
    "--active-step-color"?: string
    "--completed-step-color"?: string
    "--error-step-color"?: string
    "--step-icon-size"?: string
    "--step-icon-font-size"?: string
  }
  __activeStep?: number
  __isNextStepDisabled?: boolean
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (props, ref) => {
    const {
      className,
      children,
      orientation: orientationProp = "horizontal",
      state,
      responsive = true,
      checkIcon,
      errorIcon,
      onClickStep,
      mobileBreakpoint = 560,
      initialStep,
      variant = "circle",
      expandVerticalSteps = false,
      styles,
      variables,
      __activeStep,
      ...rest
    } = props

    const [isMobile, setIsMobile] = React.useState(false)
    const [isClient, setIsClient] = React.useState(false)

    const [activeStep, setActiveStep] = React.useState(
      __activeStep ?? initialStep
    )

    React.useEffect(() => {
      setIsClient(true)
    }, [])

    React.useEffect(() => {
      if (initialStep) {
        setActiveStep(initialStep)
      }
    }, [initialStep])

    React.useEffect(() => {
      if (__activeStep) {
        setActiveStep(__activeStep)
      }
    }, [__activeStep])

    const isError = state === "error"
    const isLoading = state === "loading"

    const orientation = isMobile && responsive ? "vertical" : orientationProp

    const isVertical = orientation === "vertical"

    React.useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < mobileBreakpoint)
      }
      handleResize()
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }, [mobileBreakpoint])

    const contextValue: StepperContextValue = {
      ...props,
      isVertical,
      isError,
      isLoading,
      activeStep,
      initialStep,
    }

    const stepCount = React.Children.count(children)

    const steps = React.Children.toArray(children) as React.ReactElement[]

    const clickable = !!onClickStep

    return (
      <StepperContext.Provider
        value={{
          ...contextValue,
          stepCount,
          clickable,
          expandVerticalSteps,
          activeStep,
          initialStep,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "flex w-full flex-wrap justify-between gap-4",
            isVertical ? "flex-col" : "flex-row",
            styles?.["main-container"],
            className
          )}
          style={
            {
              "--step-color": "hsl(var(--muted-foreground))",
              "--active-step-color": "hsl(var(--primary))",
              "--completed-step-color": "hsl(var(--primary))",
              "--error-step-color": "hsl(var(--destructive))",
              "--step-icon-size": "2rem",
              "--step-icon-font-size": "1rem",
              ...variables,
            } as React.CSSProperties
          }
          {...rest}
        >
          <div
            className={cn(
              "flex",
              isVertical ? "flex-col" : "w-full",
              isVertical ? styles?.["vertical-steps"] : styles?.["horizontal-steps"]
            )}
          >
            {steps.map((step, i) => {
              const isLastStep = i === stepCount - 1
              const isCurrentStep = i === activeStep
              const isCompletedStep = i < activeStep

              const stepProps = {
                ...step.props,
                index: i,
                isLastStep,
                isCurrentStep,
                isCompletedStep,
              }

              return React.cloneElement(step, stepProps)
            })}
          </div>
        </div>
      </StepperContext.Provider>
    )
  }
)

Stepper.displayName = "Stepper"

type StepProps = {
  className?: string
  children?: React.ReactNode
  label?: string | React.ReactNode
  description?: string | React.ReactNode
  icon?: React.ReactNode
  index?: number
  isLastStep?: boolean
  isCurrentStep?: boolean
  isCompletedStep?: boolean
  checkIcon?: React.ReactNode
  errorIcon?: React.ReactNode
  onClickStep?: (step: number, setStep: (step: number) => void) => void
}

const Step = React.forwardRef<HTMLDivElement, StepProps>((props, ref) => {
  const {
    className,
    index,
    isLastStep,
    isCurrentStep,
    isCompletedStep,
    label,
    description,
    icon,
    children,
  } = props
  const {
    isVertical,
    isError,
    isLoading,
    clickable,
    onClickStep,
    stepCount = 0,
    variant,
    expandVerticalSteps,
    styles,
    activeStep,
  } = useStepper()

  const hasVisited =
    (isCurrentStep || isCompletedStep || false) && index !== activeStep
  const [_, setStep] = React.useState(activeStep)

  const stepContextValue: StepContextValue = {
    ...props,
    isLastStep: isLastStep || false,
    isCurrentStep: isCurrentStep || false,
    isCompletedStep: isCompletedStep || false,
    step: index || 0,
    label: label,
    isError: isError || false,
    isLoading: isLoading || false,
    hasVisited,
  }

  const handleStepClick = () => {
    if (onClickStep && clickable) {
      onClickStep(index || 0, setStep)
    }
  }

  const renderChildren = () => {
    if (!children) return null
    if (isVertical && !expandVerticalSteps) {
      if (isCurrentStep) {
        return children
      }
      return null
    }

    if (isCurrentStep) {
      return children
    }
    return null
  }

  return (
    <StepContext.Provider value={stepContextValue}>
      <div
        ref={ref}
        className={cn(
          "stepper__step",
          "flex items-center gap-4",
          isVertical ? "flex-col" : "flex-row",
          styles?.["main-container"]
        )}
      >
        <div
          className={cn(
            "stepper__step-container",
            "flex items-center gap-4",
            variant === "line" && isVertical && "flex-col",
            isVertical ? styles?.["vertical-step"] : styles?.["horizontal-step"]
          )}
        >
          <div
            className={cn(
              "stepper__step-content-container",
              "flex items-center gap-4",
              variant === "line" && isVertical && "flex-col",
              isVertical
                ? styles?.["vertical-step-container"]
                : styles?.["horizontal-step-container"]
            )}
            onClick={handleStepClick}
          >
            {children}
          </div>
        </div>
      </div>
    </StepContext.Provider>
  )
})

Step.displayName = "Step"

const StepIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCurrentStep, isCompletedStep, isError, isLoading, icon } = useStep()
  const { checkIcon, errorIcon, variant } = useStepper()

  return (
    <div
      ref={ref}
      className={cn(
        "stepper__step-indicator",
        "flex h-8 w-8 items-center justify-center rounded-full text-sm",
        variant === "circle-alt" &&
          "size-[var(--step-icon-size)] min-w-[var(--step-icon-size)] border-2 font-semibold",
        variant === "circle" &&
          "size-[var(--step-icon-size)] min-w-[var(--step-icon-size)] border-2 font-semibold",
        "data-[completed=true]:border-primary data-[completed=true]:bg-primary data-[completed=true]:text-primary-foreground",
        "data-[current=true]:border-primary",
        "data-[invalid=true]:border-destructive data-[invalid=true]:bg-destructive",
        isCompletedStep && "bg-primary text-primary-foreground",
        isCurrentStep && "border-primary",
        isError && "bg-destructive text-destructive-foreground",
        className
      )}
      {...props}
    >
      <div className="stepper__step-indicator-content">
        {isCompletedStep ? (
          <Check />
        ) : isError ? (
          errorIcon || "E"
        ) : (
          icon
        )}
      </div>
    </div>
  )
})

StepIndicator.displayName = "StepIndicator"

const StepIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>((props, ref) => {
  const { isCompletedStep } = useStep()
  return isCompletedStep ? <Check ref={ref} {...props} /> : null
})

StepIcon.displayName = "StepIcon"

const StepNumber = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { step, isCompletedStep } = useStep()
  if (isCompletedStep) {
    return <StepIcon />
  }
  return (
    <div ref={ref} {...props}>
      {step + 1}
    </div>
  )
})

StepNumber.displayName = "StepNumber"

const StepStatus = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active: React.ReactNode,
    inactive: React.ReactNode,
    complete: React.ReactNode,
  }
>(({ className, active, inactive, complete, ...props }, ref) => {
  const { isCompletedStep, isCurrentStep, isError, isLoading } = useStep()
  
  if(isCurrentStep){
      return <div ref={ref} className={className} {...props}>{active}</div>
  }
  if (isCompletedStep) {
    return <div ref={ref} className={className} {...props}>{complete}</div>
  }
  return <div ref={ref} className={className} {...props}>{inactive || active}</div>
})

StepStatus.displayName = "StepStatus"


const StepTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  const { isCompletedStep, isCurrentStep } = useStep()
  return (
    <p
      ref={ref}
      className={cn(
        "font-medium",
        isCompletedStep ? "text-primary" : "text-muted-foreground",
        isCurrentStep && "text-white font-semibold",
        props.className
      )}
      {...props}
    >
      {props.children}
    </p>
  )
})

StepTitle.displayName = "StepTitle"

const StepDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  const { isCompletedStep, isCurrentStep } = useStep()
  return (
    <p
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground",
        (isCompletedStep || isCurrentStep) && "text-white/80",
        props.className
      )}
      {...props}
    >
      {props.children}
    </p>
  )
})

StepDescription.displayName = "StepDescription"

const Box = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-left", className)}
        {...props}
      />
    )
  }
)

Box.displayName = "Box"


const StepperFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex justify-end gap-2 mt-4", props.className)}
      {...props}
    >
      {props.children}
    </div>
  )
})

StepperFooter.displayName = "StepperFooter"

const StepperNext = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>((props, ref) => {
    const {__isNextStepDisabled} = useStepper()
  return (
    <Button
      ref={ref}
      size="sm"
      disabled={__isNextStepDisabled}
      {...props}
    >
      {props.children || "Next"}
    </Button>
  )
})

StepperNext.displayName = "StepperNext"

const StepperPrevious = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>((props, ref) => {
  const { initialStep, activeStep } = useStepper()
  const isDisabled = activeStep === initialStep
  return (
    <Button
      ref={ref}
      size="sm"
      variant="secondary"
      disabled={isDisabled}
      {...props}
    >
      {props.children || "Back"}
    </Button>
  )
})

StepperPrevious.displayName = "StepperPrevious"

export {
  Stepper,
  Step,
  StepIndicator,
  StepIcon,
  StepNumber,
  StepStatus,
  StepTitle,
  StepDescription,
  Box,
  StepperFooter,
  StepperNext,
  StepperPrevious,
  useStepper,
  useStep,
}
