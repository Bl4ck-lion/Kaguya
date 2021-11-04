import { useVideoOptions } from "@/contexts/VideoOptionsContext";
import Hls, { Config } from "hls.js";
import React, { MutableRefObject, useEffect, useRef } from "react";

export interface HlsPlayerProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  hlsConfig?: Config;
  src: string;
  autoPlay?: boolean;
}

const ReactHlsPlayer = React.forwardRef<HTMLVideoElement, HlsPlayerProps>(
  ({ hlsConfig, src, autoPlay, ...props }, ref) => {
    const myRef = useRef<HTMLVideoElement>(null);
    const hls = useRef(new Hls({ enableWorker: false, ...hlsConfig }));
    const { options, setOptions } = useVideoOptions();

    useEffect(() => {
      if (!hls?.current?.levels) return;

      hls.current.currentLevel = hls.current.levels
        .sort((a, b) => b.bitrate - a.bitrate)
        .findIndex((level) => level.height === options?.currentQuality);
    }, [options?.currentQuality]);

    useEffect(() => {
      function _initPlayer() {
        if (hls.current != null) {
          hls.current.destroy();

          hls.current = new Hls({
            enableWorker: false,
            ...hlsConfig,
          });
        }

        if (myRef.current != null) {
          hls.current.attachMedia(myRef.current);
        }

        hls.current.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.current.loadSource(src);

          hls.current.on(Hls.Events.MANIFEST_PARSED, () => {
            if (autoPlay) {
              myRef?.current
                ?.play()
                .catch(() =>
                  console.log(
                    "Unable to autoplay prior to user interaction with the dom."
                  )
                );
            }

            const levels = hls.current.levels
              .map((level) => level.height)
              .filter((level) => level)
              .sort((a, b) => b - a);

            setOptions((prev) => ({
              ...prev,
              qualities: levels.length
                ? [
                    // @ts-ignore
                    ...new Set<number>(levels),
                  ]
                : [],
              currentQuality: levels[0],
            }));
          });
        });

        hls.current.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.current.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.current.recoverMediaError();
                break;
              default:
                _initPlayer();
                break;
            }
          }
        });
      }

      if (Hls.isSupported() && src.includes("m3u8")) {
        _initPlayer();
      } else {
        myRef.current.src = src;
        myRef.current.autoplay = autoPlay;
      }

      return () => {
        if (hls.current != null) {
          hls.current.destroy();
        }
      };
    }, [autoPlay, hlsConfig, setOptions, src]);

    return (
      <video
        className="hls-player"
        ref={(node) => {
          myRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as MutableRefObject<HTMLVideoElement>).current = node;
          }
        }}
        {...props}
      />
    );
  }
);

ReactHlsPlayer.displayName = "ReactHlsPlayer";

export default ReactHlsPlayer;