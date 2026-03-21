// src/features/auth/SignupPage.tsx
import { useState } from "react";
import UsernameStep from "./components/UsernameStep";
import MnemonicRevealStep from "./components/MnemonicRevealStep";

type Step = "username" | "mnemonic";

export default function SignupPage() {
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");

  if (step === "username") {
    return (
      <UsernameStep
        initialUsername={username}
        onNext={(u) => {
          setUsername(u);
          setStep("mnemonic");
        }}
      />
    );
  }

  return (
    <MnemonicRevealStep
      username={username}
      onBack={() => setStep("username")}
    />
  );
}
