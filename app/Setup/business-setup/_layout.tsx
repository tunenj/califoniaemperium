import { Slot } from "expo-router";
import { SetupProvider } from "@/context/SetupContext";

export default function BusinessSetupLayout() {
  return (
    <SetupProvider>
      <Slot />
    </SetupProvider>
  );
}
