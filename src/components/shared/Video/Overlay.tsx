import ForwardIcon from "@/components/icons/ForwardIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import RewindIcon from "@/components/icons/RewindIcon";
import { useVideo } from "@/contexts/VideoContext";
import useDevice from "@/hooks/useDevice";
import useEventListener from "@/hooks/useEventListener";
import classNames from "classnames";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import React, { useCallback, useState } from "react";
import { AiOutlineLoading3Quarters, AiOutlinePause } from "react-icons/ai";
import ControlsIcon from "./ControlsIcon";

const Overlay: React.FC<HTMLMotionProps<"div">> = ({ className, ...props }) => {
  const { state, videoEl } = useVideo();
  const { isMobile } = useDevice();
  const [showOverlay, setShowOverlay] = useState(false);

  const handleOverlayClick = () => {
    if (isMobile) return;

    if (videoEl.paused) {
      videoEl.play();
    } else {
      videoEl.pause();
    }
  };

  const seek = useCallback(
    (time: number) => () => {
      if (!videoEl) return;

      videoEl.currentTime = videoEl.currentTime + time;
    },
    [videoEl]
  );

  const handlePlay = useCallback(() => {
    videoEl.play();
  }, [videoEl]);

  const handlePause = useCallback(() => {
    videoEl.pause();
  }, [videoEl]);

  useEventListener("controls-shown", () => {
    setShowOverlay(true);
  });

  useEventListener("controls-hidden", () => {
    setShowOverlay(false);
  });

  return (
    <AnimatePresence exitBeforeEnter>
      {showOverlay && (
        <motion.div
          variants={{ show: { opacity: 1 }, hide: { opacity: 0 } }}
          initial="hide"
          animate="show"
          exit="hide"
          className={classNames(
            "absolute inset-0 w-full z-30 flex items-center justify-center",
            isMobile && "bg-black/70",
            className
          )}
          onClick={handleOverlayClick}
          {...props}
        >
          <div className="flex items-center justify-between w-2/3">
            <ControlsIcon
              width="3rem"
              height="3rem"
              Icon={RewindIcon}
              onClick={seek(-10)}
              whileTap={{ rotate: -20 }}
            />

            {state.buffering ? (
              <ControlsIcon
                Icon={AiOutlineLoading3Quarters}
                className="animate-spin"
              />
            ) : state.paused ? (
              <ControlsIcon
                width="3.5rem"
                height="3.5rem"
                Icon={PlayIcon}
                onClick={handlePlay}
              />
            ) : (
              <ControlsIcon
                width="3rem"
                height="3rem"
                Icon={AiOutlinePause}
                onClick={handlePause}
              />
            )}

            <ControlsIcon
              width="3rem"
              height="3rem"
              Icon={ForwardIcon}
              onClick={seek(10)}
              whileTap={{ rotate: 20 }}
            />
          </div>

          {props.children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Overlay;