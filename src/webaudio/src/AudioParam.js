import React, { useContext, useEffect } from "react";
import { OutputContext } from "./shared";

const useNodeParam = name => {
  const node = useContext(OutputContext);
  if (!node) return;
  const nodeParam = node[name];
  if (!nodeParam) throw new Error(`AudioParam '${name}' not found!`);
  return nodeParam;
};

// Allow to set a param of the parent with either a js value or a children node!
export const AudioParam = ({ name, value, children }) => {
  const nodeParam = useNodeParam(name);
  useEffect(() => {
    if (!nodeParam || typeof value === "undefined") return;
    nodeParam.value = value;
  });
  if (!nodeParam) return null;
  return (
    <OutputContext.Provider value={nodeParam}>
      {children}
    </OutputContext.Provider>
  );
};
