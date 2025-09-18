import * as React from 'react';
import {cn} from '../../lib/utils';

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({className, orientation = 'horizontal', decorative = true, ...props}, ref) => (
    <div
      ref={ref}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      data-orientation={orientation}
      aria-hidden={decorative}
      {...props}
    />
  )
);
Separator.displayName = 'Separator';

export {Separator};
