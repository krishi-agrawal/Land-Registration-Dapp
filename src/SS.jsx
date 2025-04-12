import PlotMap from "./PlotMap";
import "./styles.css";

export default function App() {
  const polygonCoordinates = [
    [28.6139, 77.2090],  // Point 1 (New Delhi, India)
    [28.7041, 77.1025],  // Point 2
    [28.5355, 77.3910],  // Point 3
    [28.4089, 77.3178],  // Point 4
    [28.4595, 77.0266],  // Point 5
    [28.6139, 77.2090]   // Closing the polygon (same as Point 1)
];
  return (
    <PlotMap coordinates = {polygonCoordinates} />
  );
}