
'use client';
import { useState, useCallback } from 'react';

interface UseStepsProps {
  initialStep: number;
  count?: number;
}

export function useSteps({ initialStep, count }: UseStepsProps) {
  const [activeStep, setActiveStep] = useState(initialStep);

  const maxStep = count ? count - 1 : Infinity;

  const goToNext = useCallback(() => {
    setActiveStep((step) => Math.min(step + 1, maxStep));
  }, [maxStep]);

  const goToPrevious = useCallback(() => {
    setActiveStep((step) => Math.max(step - 1, 0));
  }, []);

  const setStep = useCallback((step: number) => {
    const newStep = Math.max(0, Math.min(step, maxStep));
    setActiveStep(newStep);
  }, [maxStep]);

  return {
    activeStep,
    goToNext,
    goToPrevious,
    setStep,
  };
}
