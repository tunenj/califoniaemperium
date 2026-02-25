import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  BackHandler,
  Platform,
  useWindowDimensions,
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
  const { language, setLanguage } = useLanguage();
  const [showPicker, setShowPicker] = useState(false);

  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;

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

  const handleNext = () => {
    if (!language) return;
    router.push("/OnboardingSignUp");
  };

  const handleSelectLanguage = (item: Language) => {
    setLanguage(item);
    setShowPicker(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Web Center Wrapper */}
      <View
        style={
          isWeb
            ? {
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 20,
              }
            : { flex: 1 }
        }
      >
        <View
          style={
            isWeb
              ? {
                  width: "100%",
                  maxWidth: 1100,
                  flexDirection: isLargeScreen ? "row" : "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                }
              : { flex: 1, paddingHorizontal: 24 }
          }
        >
          {/* Illustration */}
          <View
            style={
              isWeb && isLargeScreen
                ? { flex: 1, alignItems: "center" }
                : { alignItems: "center", marginTop: 60 }
            }
          >
            <Image
              source={require("@/assets/images/language.png")}
              style={{ width: 320, height: 320 }}
              resizeMode="contain"
            />
          </View>

          {/* Form Section */}
          <View
            style={
              isWeb
                ? {
                    flex: 1,
                    maxWidth: 400,
                    width: "100%",
                    marginTop: isLargeScreen ? 0 : 40,
                  }
                : {}
            }
          >
            <Text className="text-center text-xl font-semibold mt-8">
              Select <Text className="text-red-600">Language</Text>
            </Text>

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
                {language
                  ? `${language.nativeName} (${language.name})`
                  : "Select language"}
              </Text>
            </TouchableOpacity>

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
          </View>
        </View>
      </View>

      {/* -------------------- LANGUAGE MODAL -------------------- */}
      <Modal
        visible={showPicker}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPicker(false)}
      >
        <View
          style={
            isWeb
              ? {
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 20,
                }
              : {
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  justifyContent: "flex-end",
                }
          }
        >
          <View
            style={
              isWeb
                ? {
                    width: "100%",
                    maxWidth: 500,
                    backgroundColor: "white",
                    borderRadius: 20,
                    padding: 24,
                    maxHeight: "70%",
                  }
                : {
                    backgroundColor: "white",
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    padding: 24,
                    maxHeight: "60%",
                  }
            }
          >
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
                    <Text className="text-sm text-gray-500">
                      {item.name}
                    </Text>
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