import React, { useState, useContext, useEffect } from "react";
import { WebAudioContext, OutputContext, useConnectToOutput } from "./shared";

export const Convolver = ({ buffer, normalize, children }) => {
  const context = useContext(WebAudioContext);
  const [node, setNode] = useState(() => context.createBufferSource());
  useEffect(
    () => {
      if (!buffer) return;
      const node = context.createConvolver();
      node.buffer = buffer;
      node.normalize = normalize;
      node.start(0);
      setNode(node);
      return () => node.stop(0);
    },
    [buffer, normalize]
  );
  useConnectToOutput(node);
  return (
    <OutputContext.Provider value={node}>{children}</OutputContext.Provider>
  );
};
