import React, { useContext, useEffect, useState } from "react";

export const MIDIContext = React.createContext(null);

const COMMAND_NOTE_OFF = 8;
const COMMAND_NOTE_ON = 9;
const COMMAND_CONTROL = 11;

export const MIDIAccess = ({ children }) => {
  const [midi, setMIDI] = useState(null);

  useEffect(() => {
    let unmounted;
    navigator.requestMIDIAccess().then(access => {
      if (unmounted) return;

      const controlListeners = [];
      const noteListeners = [];

      const controlValues = Array(256).fill(0);
      const noteOffResolve = {};

      function callListeners(all, ...rest) {
        all.forEach(f => f(...rest));
      }

      for (const input of access.inputs.values()) {
        input.onmidimessage = message => {
          const command = message.data[0] >> 4;
          const channel = message.data[0] & 0xf;
          const note = message.data[1];
          const velocity = message.data[2] / 127;
          if (command === COMMAND_CONTROL) {
            const value = velocity;
            controlValues[note] = value;
            callListeners(controlListeners, value, note, channel);
          } else if (command === COMMAND_NOTE_ON) {
            const noteOffPromise = new Promise(resolve => {
              noteOffResolve[note] = resolve;
            });
            callListeners(noteListeners, note, velocity, noteOffPromise);
          } else if (command === COMMAND_NOTE_OFF) {
            if (note in noteOffResolve) {
              noteOffResolve[note]();
              delete noteOffResolve[note];
            }
          }
        };
      }

      const getControlValue = id => controlValues[id];

      const getControlValues = () => controlValues;

      const makeListener = all => {
        return f => {
          all.push(f);
          return () => {
            const i = all.indexOf(f);
            if (i !== -1) {
              all.splice(i, 1);
            }
          };
        };
      };

      const listenControl = makeListener(controlListeners);
      const listenNote = makeListener(noteListeners);

      setMIDI({
        getControlValue,
        getControlValues,
        listenControl,
        listenNote
      });

      // TODO could smartly detect new devices... for now we just take one at mount.
      /*
        access.onstatechange = e => {
          if (unmounted) return;
          console.log(e.port.name, e.port.manufacturer, e.port.state);
        };
      */
    });
    return () => {
      unmounted = true;
    };
  }, []);

  return <MIDIContext.Provider value={midi}>{children}</MIDIContext.Provider>;
};

export const useMIDINoteEffect = cb => {
  const midi = useContext(MIDIContext);
  useEffect(
    () => {
      if (!midi) return;
      return midi.listenNote(cb);
    },
    [midi]
  );
};

export const useMIDIControlEffect = cb => {
  const midi = useContext(MIDIContext);
  useEffect(
    () => {
      if (!midi) return;
      return midi.listenControl(cb);
    },
    [midi]
  );
};

export const useMIDIControlValue = id => {
  const midi = useContext(MIDIContext);
  const [value, setValue] = useState(
    () => (midi ? midi.getControlValue(id) : 0)
  );
  useEffect(
    () => {
      if (!midi) return;
      return midi.listenControl((value, eventId) => {
        if (eventId === id) setValue(value);
      });
    },
    [id, midi]
  );
  return value;
};

export const useMIDIControlValues = () => {
  const midi = useContext(MIDIContext);
  const [controlValues, setValues] = useState(
    () => (midi ? midi.getControlValues() : Array(256).fill(0))
  );
  useEffect(
    () => {
      if (!midi) return;
      return midi.listenControl(() => {
        setValues(midi.getControlValues());
      });
    },
    [midi]
  );
  return controlValues;
};
