import { useState, useContext, useEffect } from "react";
import {
  WebAudioContext,
  useConnectToOutput,
  useAudioParamValue,
  useAudioFieldValue
} from "./shared";

export const AudioBufferSource = ({
  buffer,
  loop,
  playbackRate,
  detune,
  children
}) => {
  const context = useContext(WebAudioContext);
  const [node, setNode] = useState(() => context.createBufferSource());
  useEffect(
    () => {
      if (!buffer) return;
      const node = context.createBufferSource();
      node.buffer = buffer;
      node.start(0);
      setNode(node);
      return () => node.stop(0);
    },
    [buffer]
  );
  useAudioParamValue(node.playbackRate, playbackRate);
  useAudioParamValue(node.detune, detune);
  useAudioFieldValue(node, "loop", loop);
  useConnectToOutput(node);
  return children || null;
};
