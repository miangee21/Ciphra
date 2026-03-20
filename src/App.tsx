//src/App.tsx
import "./App.css";
import { Button } from "./components/ui/button";

function App() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl text-pink-900 font-bold underline">
          Hello world!
        </h1>
        <Button>Get Started</Button>
      </div>
    </div>
  );
}

export default App;
