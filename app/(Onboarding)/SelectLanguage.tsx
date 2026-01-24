import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useLanguage,
  LANGUAGES,
  type Language,
} from "@/context/LanguageContext";

const SelectLanguage = () => {
  const router = useRouter();
  const { language, setLanguage } = useLanguage(); // language is Language | null
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (showPicker) {
        setShowPicker(false);
        return true;
      }
      return false;
    };

    const handler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => handler.remove();
  }, [showPicker]);

  /* -------------------- HANDLERS -------------------- */
  const handleNext = () => {
    if (!language) return;
    router.push("/OnboardingSignUp");
  };

  const handleSelectLanguage = (item: Language) => {
    setLanguage(item); // Pass the Language object
    setShowPicker(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      {/* Illustration */}
      <View className="items-center mt-16">
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

      {/* Dropdown Button */}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="border border-gray-300 rounded-lg mt-6 px-4 py-4"
        activeOpacity={0.7}
      >
        <Text
          className={`text-base ${language ? "text-black" : "text-gray-400"}`}
        >
          {language ? `${language.nativeName} (${language.name})` : "Select language"}
        </Text>
      </TouchableOpacity>

      {/* Next Button */}
      <TouchableOpacity
        disabled={!language}
        onPress={handleNext}
        className={`mt-10 py-3 rounded-lg ${language ? "bg-red-600" : "bg-red-300"}`}
        activeOpacity={0.8}
      >
        <Text className="text-center text-white font-semibold text-base">
          Next
        </Text>
      </TouchableOpacity>

      {/* -------------------- LANGUAGE MODAL -------------------- */}
      <Modal
        visible={showPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPicker(false)}
      >
        <View className="flex-1 bg-black/30 justify-end">
          {/* CONTENT */}
          <View className="bg-white rounded-t-3xl p-6 max-h-[60%]">
            <Text className="text-lg font-semibold mb-4">
              Choose Language
            </Text>

            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectLanguage(item)}
                  className={`py-4 border-b border-gray-100 flex-row justify-between items-center ${
                    language?.code === item.code ? "bg-red-50" : ""
                  }`}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text className="text-base text-black font-medium">
                      {item.nativeName}
                    </Text>
                    <Text className="text-sm text-gray-500">{item.name}</Text>
                  </View>
                  {language?.code === item.code && (
                    <View className="w-6 h-6 rounded-full bg-red-600 items-center justify-center">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  className="py-4 mt-2"
                >
                  <Text className="text-center text-red-600 font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SelectLanguage;