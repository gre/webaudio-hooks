import React, { useContext, useEffect, useState } from "react";
import { WebAudioContext, OutputContext, useAudioFieldValue } from "./shared";

export const Analyser = ({
  fftSize,
  minDecibels,
  maxDecibels,
  smoothingTimeConstant,
  onAnalyserNode,
  children
}) => {
  const context = useContext(WebAudioContext);
  const [node] = useState(() => context.createAnalyser());
  useEffect(() => {
    if (!onAnalyserNode) return;
    onAnalyserNode(node);
  }, []);
  useAudioFieldValue(node, "fftSize", fftSize);
  useAudioFieldValue(node, "minDecibels", minDecibels);
  useAudioFieldValue(node, "maxDecibels", maxDecibels);
  useAudioFieldValue(node, "smoothingTimeConstant", smoothingTimeConstant);
  return (
    <OutputContext.Provider value={node}>{children}</OutputContext.Provider>
  );
};
