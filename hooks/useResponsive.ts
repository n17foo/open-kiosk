import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

type Breakpoint = 'compact' | 'medium' | 'expanded';

interface ResponsiveInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isCompact: boolean;
  isMedium: boolean;
  isExpanded: boolean;
  columns: number;
}

function getBreakpoint(width: number): Breakpoint {
  if (width < 600) return 'compact';
  if (width < 1024) return 'medium';
  return 'expanded';
}

function getColumns(breakpoint: Breakpoint): number {
  switch (breakpoint) {
    case 'compact':
      return 2;
    case 'medium':
      return 3;
    case 'expanded':
      return 4;
  }
}

function buildInfo(dimensions: ScaledSize): ResponsiveInfo {
  const { width, height } = dimensions;
  const breakpoint = getBreakpoint(width);
  return {
    width,
    height,
    breakpoint,
    isCompact: breakpoint === 'compact',
    isMedium: breakpoint === 'medium',
    isExpanded: breakpoint === 'expanded',
    columns: getColumns(breakpoint),
  };
}

export function useResponsive(): ResponsiveInfo {
  const [info, setInfo] = useState<ResponsiveInfo>(() => buildInfo(Dimensions.get('window')));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setInfo(buildInfo(window));
    });
    return () => subscription.remove();
  }, []);

  return info;
}
