import OscilloscopeVisualizer from "./components/OscilloscopeVisualiser";
export default function Home() {
  return (
    <div>
      <OscilloscopeVisualizer decay={0.01} lineThickness={5} sparkleReactiveness={0.8} sparkleVelocity={10} sparkleColor="#FF00FF" sparkleSize={2}/>
    </div>
  );
}
