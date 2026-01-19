import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number; // 1-based
}

export default function StepIndicator({
  totalSteps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <View className="flex-row items-center justify-between mt-4 px-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <View key={step} className="flex-row items-center">
            {/* Step Circle */}
            <View
              className={`w-7 h-7 rounded-full items-center justify-center
                ${
                  isCompleted
                    ? "bg-black"
                    : isActive
                    ? "border-2 border-black bg-white"
                    : "border border-gray-300 bg-white"
                }
              `}
            >
              {isCompleted ? (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color="white"
                />
              ) : (
                <Text
                  className={`text-xs font-medium ${
                    isActive
                      ? "text-black"
                      : "text-gray-400"
                  }`}
                >
                  {step}
                </Text>
              )}
            </View>

            {/* Connector */}
            {step !== totalSteps && (
              <View
                className={`h-[2px] w-10 mx-1 ${
                  isCompleted
                    ? "bg-black"
                    : "bg-gray-300"
                }`}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
