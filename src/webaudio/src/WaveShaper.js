import React, { useState, useContext } from "react";
import {
  WebAudioContext,
  OutputContext,
  useConnectToOutput,
  useAudioFieldValue
} from "./shared";

export const WaveShaper = ({ children, curve, oversample }) => {
  const context = useContext(WebAudioContext);
  const [node] = useState(() => context.createWaveShaper());
  useAudioFieldValue(node, "curve", curve);
  useAudioFieldValue(node, "oversample", oversample);
  useConnectToOutput(node);
  return (
    <OutputContext.Provider value={node}>{children}</OutputContext.Provider>
  );
};
