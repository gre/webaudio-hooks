import React, { useState, useContext, useEffect } from "react";
import {
  WebAudioContext,
  OutputContext,
  useConnectToOutput,
  useStartAudioNode,
  useAudioParamValue,
  useAudioFieldValue
} from "./shared";

export const Oscillator = ({
  children,
  type,
  frequency,
  detune,
  periodicWave
}) => {
  const context = useContext(WebAudioContext);
  const [oscillator] = useState(() => context.createOscillator());
  useAudioFieldValue(oscillator, "type", type);
  useAudioParamValue(oscillator.frequency, frequency);
  useAudioParamValue(oscillator.detune, detune);
  useEffect(
    () => {
      if (periodicWave) oscillator.setPeriodicWave(periodicWave);
    },
    [periodicWave]
  );
  useStartAudioNode(oscillator);
  useConnectToOutput(oscillator);
  return (
    <OutputContext.Provider value={oscillator}>
      {children}
    </OutputContext.Provider>
  );
};
