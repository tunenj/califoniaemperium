import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSetup } from "@/context/SetupContext";

export default function SaveExitButton() {
  const router = useRouter();
  const { saveDraft } = useSetup(); // ✅ correct

  return (
    <TouchableOpacity
      onPress={async () => {
        await saveDraft();
        router.replace("/Setup/successScreen");
      }}
    >
      <Text className="text-xs text-gray-400">
        Save & continue later
      </Text>
    </TouchableOpacity>
  );
}
