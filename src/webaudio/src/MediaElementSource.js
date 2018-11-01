import { useState, useContext, useEffect, useRef } from "react";
import { WebAudioContext, useConnectToOutput } from "./shared";

export const MediaElementSource = ({ children }) => {
  const context = useContext(WebAudioContext);
  const [node, setNode] = useState(null);
  const ref = useRef(null);
  useEffect(
    () => {
      if (!ref.current) return;
      setNode(context.createMediaElementSource(ref.current));
    },
    [ref]
  );
  useConnectToOutput(node);
  return children(ref);
};
