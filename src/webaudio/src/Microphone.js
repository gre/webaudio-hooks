import React, { useState, useEffect } from "react";
import { MediaStreamSource } from "./MediaStreamSource";

export const Microphone = () => {
  const [stream, setStream] = useState(null);
  useEffect(() => {
    let unmounted = false;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      if (unmounted) return;
      setStream(stream);
    });
    return () => {
      unmounted = true;
    };
  }, []);
  return <MediaStreamSource stream={stream} />;
};
