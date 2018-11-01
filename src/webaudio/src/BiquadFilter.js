import React, { useState, useContext } from "react";
import {
  WebAudioContext,
  OutputContext,
  useConnectToOutput,
  useAudioParamValue,
  useAudioFieldValue
} from "./shared";

export const BiquadFilter = ({ children, type, frequency, Q, gain }) => {
  const context = useContext(WebAudioContext);
  const [filter] = useState(() => context.createBiquadFilter());
  useAudioFieldValue(filter, "type", type);
  useAudioParamValue(filter.gain, gain);
  useAudioParamValue(filter.frequency, frequency);
  useAudioParamValue(filter.Q, Q);
  useConnectToOutput(filter);
  return (
    <OutputContext.Provider value={filter}>{children}</OutputContext.Provider>
  );
};
