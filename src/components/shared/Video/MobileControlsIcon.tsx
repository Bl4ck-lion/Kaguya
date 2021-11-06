import React from "react";
import ControlsIcon, { ControlsIconProps } from "./ControlsIcon";

export interface MobileControlsIconProps extends ControlsIconProps {
  title: string;
  onClick?: () => void;
}

const MobileControlsIcon: React.FC<MobileControlsIconProps> = ({
  title,
  onClick,
  ...props
}) => {
  return (
    <div
      className="flex items-center space-x-2 px-1 rounded-md hover:bg-white/20"
      onClick={onClick}
    >
      <ControlsIcon {...props} />

      <p>{title}</p>
    </div>
  );
};

export default MobileControlsIcon;