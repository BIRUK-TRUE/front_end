'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  id?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
}

export function Slider({
  id,
  min = 0,
  max = 100,
  step = 1,
  value = [0],
  onValueChange,
  className,
}: SliderProps) {
  const currentValue = value[0] ?? min;

  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={currentValue}
      onChange={(event) => onValueChange?.([Number(event.target.value)])}
      className={cn('w-full accent-primary', className)}
    />
  );
}
