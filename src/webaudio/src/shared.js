import React, { useContext, useEffect, useState } from "react";

export const WebAudioContext = React.createContext(null);
export const OutputContext = React.createContext(null);

export const useConnectToOutput = node => {
  const output = useContext(OutputContext);
  useEffect(
    () => {
      if (!node) return;
      node.connect(output);
      return () => node.disconnect(output);
    },
    [node, output]
  );
};

export const useAudioParamValue = (audioParam, value) => {
  useEffect(
    () => {
      if (typeof value === "undefined") return;
      audioParam.value = value;
    },
    [audioParam, value]
  );
};

export const useAudioFieldValue = (node, field, value) => {
  useEffect(
    () => {
      if (typeof value === "undefined") return;
      node[field] = value;
    },
    [node, field, value]
  );
};

export const useStartAudioNode = node => {
  useEffect(
    () => {
      node.start(0);
      return () => node.stop(0);
    },
    [node]
  );
};

const fetchAudioBuffer = async (context, url) => {
  const r = await fetch(url);
  const buffer = await r.arrayBuffer();
  const audioBuffer = await context.decodeAudioData(buffer);
  return audioBuffer;
};

// TODO later rewrite with Suspense
export const useAudioBufferURL = url => {
  const context = useContext(WebAudioContext);
  const [audioBuffer, setAudioBuffer] = useState(null);
  useEffect(
    () => {
      let stopped;
      const controller = new AbortController();
      fetchAudioBuffer(context, url).then(res => {
        if (stopped) return;
        setAudioBuffer(res);
      });
      return () => {
        stopped = true;
        controller.abort();
      };
    },
    [url]
  );
  return audioBuffer;
};
