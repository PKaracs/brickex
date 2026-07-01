declare module "@tabler/icons-react" {
  import * as React from "react";

  export type TablerIconProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
    stroke?: number | string;
    strokeWidth?: number | string;
  };

  export const IconCheck: React.FC<TablerIconProps>;
  export const IconMenu2: React.FC<TablerIconProps>;
  export const IconPlus: React.FC<TablerIconProps>;
  export const IconX: React.FC<TablerIconProps>;
}
