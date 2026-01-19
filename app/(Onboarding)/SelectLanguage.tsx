import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

const SelectLanguage = () => {
    const router = useRouter();
    const [language, setLanguage] = useState<string>("");

    const handleNext = () => {
        if (!language) return;
        router.push("/(Onboarding)/OnboardingSignUp");
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            {/* Illustration */}
            <View className="items-center mt-24">
                <Image
                    source={require("@/assets/images/language.png")}
                    className="w-80 h-80"
                    resizeMode="contain"
                />
            </View>

            {/* Title */}
            <Text className="text-center text-xl font-semibold mt-8">
                Select <Text className="text-red-600">Language</Text>
            </Text>

            {/* Dropdown */}
            <View className="border border-gray-300 rounded-lg mt-6 overflow-hidden">
                <Picker
                    selectedValue={language}
                    onValueChange={(value) => setLanguage(value)}
                >
                    <Picker.Item label="Select" value="" />
                    <Picker.Item label="English" value="en" />
                    <Picker.Item label="French" value="fr" />
                    <Picker.Item label="Spanish" value="es" />
                    <Picker.Item label="Portuguese" value="pt" />
                </Picker>
            </View>

            {/* Button */}
            <TouchableOpacity
                disabled={!language}
                onPress={handleNext}
                className={`mt-10 py-3 rounded-lg ${language ? "bg-red-600" : "bg-red-300"
                    }`}
            >
                <Text className="text-center text-white font-semibold text-base">
                    Next
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default SelectLanguage;
