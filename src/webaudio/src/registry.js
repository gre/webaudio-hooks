// Registry store node instance to provide Input / Output mecanism: a way to represent audio graphs in JSX.

import React, { useState, useContext, useEffect, useReducer } from "react";
import { WebAudioContext, OutputContext, useConnectToOutput } from "./shared";

const RegistryDispatchContext = React.createContext(null);
const RegistryStateContext = React.createContext(null);

const initialRegistryState = {};
function registryReducer(state, action) {
  switch (action.type) {
    case "add":
      return { ...state, [action.id]: action.node };
    case "remove":
      const newState = { ...state };
      delete newState[action.id];
      return newState;
    default:
      return initialRegistryState;
  }
}

export const AudioNodeRegistryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(registryReducer, initialRegistryState);
  return (
    <RegistryDispatchContext.Provider value={dispatch}>
      <RegistryStateContext.Provider value={state}>
        {children}
      </RegistryStateContext.Provider>
    </RegistryDispatchContext.Provider>
  );
};

export const useGainNodeRegistry = id => {
  const context = useContext(WebAudioContext);
  const dispatch = useContext(RegistryDispatchContext);
  const [node] = useState(() => context.createGain());
  useEffect(
    () => {
      dispatch({ type: "add", id, node });
      return () => dispatch({ type: "remove", id });
    },
    [id]
  );
  return node;
};

// An output does not connect to its parent unlike other nodes (it is "silent")
// instead, it is an alternative destination
// that can be refered by id (e.g. using an <Input id={id} />)
export const Output = ({ children, id }) => {
  const node = useGainNodeRegistry(id);
  return (
    <OutputContext.Provider value={node}>{children}</OutputContext.Provider>
  );
};

// an Input emit the sound of an Output
// this allow to express graphs
export const Input = ({ id }) => {
  const state = useContext(RegistryStateContext);
  const node = state[id];
  useConnectToOutput(node);
  return null;
};

// It's both an Input and Output
export const Passthrough = ({ children, id }) => {
  const node = useGainNodeRegistry(id);
  useConnectToOutput(node);
  return (
    <OutputContext.Provider value={node}>{children}</OutputContext.Provider>
  );
};
