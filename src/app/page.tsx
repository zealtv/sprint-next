import OscilloscopeVisualizer from "./components/OscilloscopeVisualiser";
export default function Home() {
  return (
    <div>
      <OscilloscopeVisualizer decay={1} attack={0} lineThickness={5} sparkleReactiveness={0.8} sparkleVelocity={10} sparkleColor="#FF00FF" sparkleSize={2}/>
    </div>
  );
}
