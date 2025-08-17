import OscilloscopeVisualizer from "./components/OscilloscopeVisualiser";
export default function Home() {
  return (
    <div>
      <OscilloscopeVisualizer 
        timeWindow={0.35} 
        decay={1} 
        attack={0.0} 
        lineThickness={5} 
        sparkleReactiveness={1.2} 
        sparkleVelocity={10} 
        sparkleColor="#FFFF00" 
        sparkleSize={3}
      />
    </div>
  );
}
