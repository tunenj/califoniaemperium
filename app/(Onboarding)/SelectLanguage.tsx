import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

type Language = {
  label: string;
  value: string;
};

const LANGUAGES: Language[] = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
];

const SelectLanguage = () => {
  const router = useRouter();

  const [language, setLanguage] = useState<Language | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  /* -------------------- ANDROID BACK HANDLER -------------------- */
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
    setLanguage(item);
    setShowPicker(false);
  };

  /* -------------------- UI -------------------- */
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

      {/* Dropdown Button */}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="border border-gray-300 rounded-lg mt-6 px-4 py-4"
        activeOpacity={0.7}
      >
        <Text
          className={`text-base ${
            language ? "text-black" : "text-gray-400"
          }`}
        >
          {language ? language.label : "Select language"}
        </Text>
      </TouchableOpacity>

      {/* Next Button */}
      <TouchableOpacity
        disabled={!language}
        onPress={handleNext}
        className={`mt-10 py-3 rounded-lg ${
          language ? "bg-red-600" : "bg-red-300"
        }`}
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
        transparent
        onRequestClose={() => setShowPicker(false)}
      >
        {/* BACKDROP */}
        <Pressable
          className="flex-1 bg-black/30 justify-end"
          onPress={() => setShowPicker(false)}
        >
          {/* CONTENT (BLOCK PRESS BUBBLING) */}
          <Pressable
            className="bg-white rounded-t-3xl p-6 max-h-[60%]"
            onPressIn={() => {}}
          >
            <Text className="text-lg font-semibold mb-4">
              Choose Language
            </Text>

            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectLanguage(item)}
                  className="py-4 border-b border-gray-100"
                >
                  <Text className="text-base text-black">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default SelectLanguage;
