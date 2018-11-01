# use-audio

`use-audio` implements a minimal implementation of using Web Audio API with React Hooks.

## Basic gist

With React JSX, we can not only represent the tree of effects but actually represent it as a graph using Input / Output helpers.
The rest of the code is simple Web Audio API concepts.

```js
<WebAudio>
  <Destination>
    <DynamicsCompressor>
      <Input id="main" />
    </DynamicsCompressor>
  </Destination>

  <Analyser fftSize={256} onAnalyserNode={onAnalyserNode}>
    <Input id="main" />
  </Analyser>

  <Output id="main">
    <Gain gain={mainGain}>
      {/* mix two sounds */}
      <Input id="fm1" />
      <Input id="guitar" />
      {/* add a Delay produce an echo */}
      <Delay delayTime={delayTime}>
        <Input id="main" />
      </Delay>
    </Gain>
  </Output>

  <Output id="guitar">
    <MediaElementSource>
      {/* can use actual dom element here, just need to provide the ref to be in the graph */}
      {ref => (
        <audio ref={ref} src="samples/acoustic_guitar.m4a" loop autoPlay />
      )}
    </MediaElementSource>
  </Output>

  <Output id="fm1">
    <AudioNodeRegistryProvider>
      <BiquadFilter frequency={1000}>
        <Oscillator type="triangle" frequency={220}>
          <AudioParam name="frequency">
            <Input id="modulator" />
          </AudioParam>
        </Oscillator>
      </BiquadFilter>

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
</WebAudio>
```

## Support

### Supported Audio nodes

> (all of these are React components)

- Gain
- Oscillator
- AudioBufferSource
- MediaElementSource
- MediaStreamSource
- BiquadFilter
- Convolver
- Delay
- DynamicsCompressor
- WaveShaper
- Analyser

#### Extra features

- Microphone
- Input / Output / Passthrough
- many hooks utility: useAudioBufferURL, useConnectToOutput, useAudioParamValue, useAudioFieldValue,...

### Not yet implement nodes

- Worklet
- panners / channels

## Future

- AudioParam different automations. how to cover it nicely?
- How to provide an easy way to trigger notes. like some sort of <NodeFactory> that manage an array of nodes with a lifecycle automation schema.
