import React, { useContext } from "react";
import { WebAudioContext, OutputContext } from "./shared";

export const Destination = ({ children }) => {
  const context = useContext(WebAudioContext);
  return (
    <OutputContext.Provider value={context.destination}>
      {children}
    </OutputContext.Provider>
  );
};
