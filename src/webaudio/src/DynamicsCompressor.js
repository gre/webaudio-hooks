import React, { useState, useContext } from "react";
import {
  WebAudioContext,
  OutputContext,
  useConnectToOutput,
  useAudioParamValue
} from "./shared";

export const DynamicsCompressor = ({
  children,
  threshold,
  knee,
  ratio,
  attack,
  release
}) => {
  const context = useContext(WebAudioContext);
  const [node] = useState(() => context.createDynamicsCompressor());
  useAudioParamValue(node.threshold, threshold);
  useAudioParamValue(node.knee, knee);
  useAudioParamValue(node.ratio, ratio);
  useAudioParamValue(node.attack, attack);
  useAudioParamValue(node.release, release);
  useConnectToOutput(node);
  return (
    <OutputContext.Provider value={node}>{children}</OutputContext.Provider>
  );
};
