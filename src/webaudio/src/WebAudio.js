import React, { useState } from "react";
import { WebAudioContext } from "./shared";
import { AudioNodeRegistryProvider } from "./registry";

export const WebAudio = ({ children }) => {
  const [context] = useState(() => new AudioContext());

  return (
    <WebAudioContext.Provider value={context}>
      <AudioNodeRegistryProvider>{children}</AudioNodeRegistryProvider>
    </WebAudioContext.Provider>
  );
};
