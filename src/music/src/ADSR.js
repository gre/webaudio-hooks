import { useEffect, useState } from "react";
import ADSREnvelope from "adsr-envelope";
import {
  useWebAudio,
  provideOutput,
  useConnectToOutput
} from "../../webaudio/src";

const OFFSET_END = 0.5;

export const ADSR = ({ params, pressed, onEnd, children }) => {
  const context = useWebAudio();
  const [node] = useState(() => context.createGain());
  const [startTime, setStartTime] = useState(0);
  const [envelope] = useState(() => new ADSREnvelope(params));

  useEffect(
    () => {
      let timeout;
      const playbackTime = context.currentTime;
      if (pressed) {
        // note on
        envelope.gateTime = Infinity;
        envelope.applyTo(node.gain, playbackTime);
        setStartTime(playbackTime);
      } else {
        // note off
        if (!startTime) return; // was not yet started
        node.gain.cancelScheduledValues(startTime);
        envelope.gateTime = playbackTime - startTime;
        envelope.applyTo(node.gain, startTime);
        if (onEnd) {
          timeout = setTimeout(
            onEnd,
            1000 *
              (OFFSET_END +
                (startTime + envelope.duration) -
                context.currentTime)
          );
        }
      }

      return () => clearTimeout(timeout);
    },
    [pressed]
  );
  useConnectToOutput(node);
  return provideOutput(node, children);
};
