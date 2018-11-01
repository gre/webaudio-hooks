import React, { useState, useContext } from "react";
import {
  WebAudioContext,
  OutputContext,
  useConnectToOutput,
  useAudioParamValue
} from "./shared";

export const Gain = ({ children, gain }) => {
  const context = useContext(WebAudioContext);
  const [node] = useState(() => context.createGain());
  useAudioParamValue(node.gain, gain);
  useConnectToOutput(node);
  return (
    <OutputContext.Provider value={node}>{children}</OutputContext.Provider>
  );
};
