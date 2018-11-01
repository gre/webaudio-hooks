import React, { useState, useContext } from "react";
import {
  WebAudioContext,
  OutputContext,
  useConnectToOutput,
  useAudioParamValue
} from "./shared";

export const Delay = ({ children, delayTime }) => {
  const context = useContext(WebAudioContext);
  const [node] = useState(() => context.createDelay());
  useAudioParamValue(node.delayTime, delayTime);
  useConnectToOutput(node);
  return (
    <OutputContext.Provider value={node}>{children}</OutputContext.Provider>
  );
};
