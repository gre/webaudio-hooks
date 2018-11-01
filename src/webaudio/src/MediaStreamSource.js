import { useState, useContext, useEffect } from "react";
import { WebAudioContext, useConnectToOutput } from "./shared";

export const MediaStreamSource = ({ stream }) => {
  const context = useContext(WebAudioContext);
  const [node, setNode] = useState(null);
  useEffect(
    () => {
      if (!stream) return;
      const node = context.createMediaStreamSource(stream);
      setNode(node);
    },
    [stream]
  );
  useConnectToOutput(node);
  return null;
};
