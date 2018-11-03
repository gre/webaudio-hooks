import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import {
  Analyser,
  AudioBufferSource,
  AudioNodeRegistryProvider,
  AudioParam,
  BiquadFilter,
  Delay,
  Destination,
  DynamicsCompressor,
  Gain,
  Input,
  MediaElementSource,
  Oscillator,
  Output,
  useAudioBufferURL,
  WaveShaper,
  WebAudio
} from "./webaudio/src";
import {
  MIDIAccess,
  useMIDIControlEffect,
  useMIDINoteEffect
} from "./webmidi/src";
import { NOTES, ADSR, EntityFactory } from "./music/src";

function makeDistortionCurve(amount) {
  var k = typeof amount === "number" ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for (; i < n_samples; ++i) {
    x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

const Distortion = ({ amount, children }) => {
  const [curve] = useState(() => makeDistortionCurve(amount || 400));
  return (
    <WaveShaper curve={curve} oversample="4x">
      {children}
    </WaveShaper>
  );
};

const Visualize = ({ analyserNode, interval }) => {
  if (!analyserNode) return null;
  const [data, setData] = useState(
    () => new Float32Array(analyserNode.frequencyBinCount)
  );
  useEffect(
    () => {
      let timeout;
      const loop = () => {
        timeout = setTimeout(loop, interval || 50);
        analyserNode.getFloatFrequencyData(data);
        setData(data);
      };
      loop();
      return () => clearTimeout(timeout);
    },
    [analyserNode]
  );
  const width = 400;
  const height = 100;
  const w = Math.floor(width / data.length);
  const minDb = analyserNode.minDecibels;
  const maxDb = analyserNode.maxDecibels;
  return (
    <svg width={width} height={height}>
      {[...data].map((value, i) => (
        <rect
          fill="#fff"
          key={i}
          x={i * w}
          y={Math.floor(
            isFinite(value)
              ? height - (height * (value - minDb)) / (maxDb - minDb)
              : height
          )}
          height={2 * height}
          width={w}
        />
      ))}
    </svg>
  );
};

/*
TODO

<Sequencer ??? />

<MonoSynth ??? />


<SequenceAudioParam
  name=""
  sequence={[
  ]}
  onDone={() => {   }}
/>

<AudioParamInterpolateValue
  name=""
  value={...}
  interpolation={{ ... }}
/>

- AudioNodeRegistryProvider => bad idea. you can't write component because it would not make them accessing the outer scope variables :(
- better sliders
- ui to assign controls to sliders
- virtual keyboard

*/

const useNotePressed = noteOffPromise => {
  const [pressed, setPressed] = useState(true);
  useEffect(() => {
    if (!noteOffPromise) return;
    let cancelled;
    noteOffPromise.then(() => {
      if (cancelled) return;
      setPressed(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return pressed;
};

const NoteADSR = ({ noteOffPromise, params, destroy, children }) => {
  const pressed = useNotePressed(noteOffPromise);
  return (
    <ADSR pressed={pressed} params={params} onEnd={destroy}>
      {children}
    </ADSR>
  );
};

const NoteFactory = ({ children }) => {
  const piano = useRef(null);
  useMIDINoteEffect((note, velocity, noteOffPromise) => {
    if (!piano.current) return;
    return piano.current.create({ note, velocity, noteOffPromise });
  });
  return <EntityFactory ref={piano}>{children}</EntityFactory>;
};

const Echo = ({ children, factor, delayTime }) => (
  <>
    <Output id="echo">
      {children}
      <Gain gain={factor}>
        <Delay delayTime={delayTime}>
          <Input id="echo" />
        </Delay>
      </Gain>
    </Output>
    <Input id="echo" />
  </>
);

const AudioDemo = ({ mainGain, delayTime, frequency, onAnalyserNode }) => {
  const acousticGuitar = useAudioBufferURL("samples/acoustic_guitar.m4a");

  return (
    <>
      <Destination>
        <Input id="main" />
      </Destination>

      <Output id="main">
        <DynamicsCompressor>
          <Echo factor={mainGain} delayTime={delayTime}>
            <Input id="piano" />
          </Echo>
        </DynamicsCompressor>
      </Output>

      <Analyser fftSize={256} onAnalyserNode={onAnalyserNode}>
        <Input id="main" />
      </Analyser>

      <Output id="piano">
        <NoteFactory>
          {({ velocity, note, noteOffPromise }, destroy) => {
            const frequency = NOTES[note];
            return (
              <Gain gain={velocity}>
                <NoteADSR
                  params={{
                    attackTime: 0.05,
                    decayTime: 0.4,
                    releaseTime: 0.5
                  }}
                  noteOffPromise={noteOffPromise}
                  destroy={destroy}
                >
                  <Oscillator type="triangle" frequency={frequency}>
                    <AudioParam name="frequency">
                      <NoteADSR
                        params={{
                          attackTime: 0.2,
                          releaseTime: 0.1
                        }}
                        noteOffPromise={noteOffPromise}
                      >
                        <Gain gain={frequency}>
                          <Oscillator type="sine" frequency={frequency * 1.5} />
                        </Gain>
                      </NoteADSR>
                    </AudioParam>
                  </Oscillator>
                </NoteADSR>
              </Gain>
            );
          }}
        </NoteFactory>
      </Output>

      <Output id="distortion">
        <BiquadFilter frequency={500 * frequency}>
          <Distortion>
            <Input id="guitar" />
          </Distortion>
        </BiquadFilter>
      </Output>

      <Output id="guitar_audio">
        <MediaElementSource>
          {ref => (
            <audio ref={ref} src="samples/acoustic_guitar.m4a" loop autoPlay />
          )}
        </MediaElementSource>
      </Output>

      <Output id="guitar">
        <AudioBufferSource
          loop
          buffer={acousticGuitar}
          playbackRate={frequency}
        />
      </Output>

      <Output id="fm1">
        {/* create local registry provider scope */}
        <AudioNodeRegistryProvider>
          <Oscillator type="triangle" frequency={220}>
            <AudioParam name="frequency">
              <Input id="modulator" />
            </AudioParam>
          </Oscillator>

          <Output id="modulator">
            <Gain gain={1}>
              <AudioParam name="gain">
                <Gain gain={400}>
                  <Oscillator type="sine" frequency={frequency} />
                </Gain>
              </AudioParam>
              <Oscillator type="sine" frequency={110} />
            </Gain>
          </Output>
        </AudioNodeRegistryProvider>
      </Output>

      <Output id="wobwob">
        <Gain>
          <AudioParam name="gain">
            <Oscillator type="sine" frequency={frequency} />
          </AudioParam>
          <Oscillator type="triangle" frequency={110} />
        </Gain>
      </Output>
    </>
  );
};

const App = () => {
  const [mainGain, setMainGain] = useState(0.4);
  const [delayTime, setDelayTime] = useState(0.5);
  const [frequency, setFrequency] = useState(1);
  const [analyserNode, setAnalyserNode] = useState(null);
  useMIDIControlEffect((value, eventId) => {
    switch (eventId % 3) {
      case 0:
        setDelayTime(value);
        break;
      case 1:
        setMainGain(value);
        break;
      case 2:
        setFrequency(value);
        break;
      default:
    }
  });

  return (
    <div className="App">
      <WebAudio>
        <AudioDemo
          delayTime={delayTime}
          frequency={frequency}
          mainGain={mainGain}
          onAnalyserNode={setAnalyserNode}
        />
      </WebAudio>

      <header className="App-header">
        <p>Web Audio API implemented with hooks</p>
        Main gain
        <input
          type="range"
          min={0.001}
          max={1}
          step={0.001}
          value={mainGain}
          onChange={e => {
            setMainGain(parseFloat(e.target.value));
          }}
        />
        Frequency
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={frequency}
          onChange={e => {
            setFrequency(parseFloat(e.target.value));
          }}
        />
        Delay
        <input
          type="range"
          min={0.00001}
          max={1}
          step={0.00001}
          value={delayTime}
          onChange={e => {
            setDelayTime(parseFloat(e.target.value));
          }}
        />
        <Visualize analyserNode={analyserNode} />
      </header>
    </div>
  );
};

export default () => (
  <MIDIAccess>
    <App />
  </MIDIAccess>
);
