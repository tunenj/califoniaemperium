import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AnimatedStep from "@/components/AnimatedStep";
import StepIndicator from "@/components/StepIndicator";
import { useSetup } from "@/context/SetupContext";

const CATEGORIES: string[] = [
  "Health & Beauty",
  "Fashion & Apparel",
  "Electronics & Gadgets",
  "Home & Kitchen",
  "Baby & Pet Supplies",
  "Hobbies & Entertainment",
];

export default function Step2() {
  const router = useRouter();
  const { data, update } = useSetup();

  const [search, setSearch] = useState<string>("");
  const filteredCategories: string[] = useMemo(() => {
    return CATEGORIES.filter((c: string) => {
      const selected = (data.categories ?? []) as string[];
      return (
        c.toLowerCase().includes(search.toLowerCase()) &&
        !selected.includes(c)
      );
    });
  }, [search, data.categories]);

  const addCategory = (category: string) => {
    update({
      categories: [...((data.categories ?? []) as string[]), category],
    });
  };

  const removeCategory = (category: string) => {
    update({
      categories: ((data.categories ?? []) as string[]).filter(
        (c: string) => c !== category
      ),
    });
  };

  const isValid =
    Boolean(data.businessName) &&
    Array.isArray(data.categories) &&
    data.categories.length > 0;

  return (
    <AnimatedStep>
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 pt-4 flex-1">
          {/* Header */}
          <View className="items-center mb-4 relative">
            <View className="w-20 h-20 items-center justify-center mx-auto mb-4">
              <Image
                source={require("@/assets/images/icon.png")}
                className="w-24 h-24"
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute left-0 top-2"
            >
              <Ionicons name="arrow-back" size={22} />
            </TouchableOpacity>

            <Text className="font-semibold text-base mt-3">
              Welcome, {data.firstName || "User"}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              Set up your business profile
            </Text>
          </View>

          {/* Step Indicator */}
          <StepIndicator totalSteps={3} currentStep={2} />

          {/* Business Name */}
          <Text className="font-medium text-black mb-4 text-center">
            Business Type
          </Text>
          <TextInput
            placeholder="Enter business name"
            value={data.businessName ?? ""}
            onChangeText={(v: string) =>
              update({ businessName: v })
            }
            className="border-b py-2 mb-5"
          />

          {/* Categories */}
          <Text className="text-xs text-gray-400 mb-2">
            Products Categories
          </Text>

          {/* Search */}
          <View className="flex-row items-center border rounded-lg px-3 py-0.5 mb-3">
            <TextInput
              placeholder="Search Products"
              value={search}
              onChangeText={setSearch}
              className="flex-1"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close" size={18} />
              </TouchableOpacity>
            )}
          </View>

          {/* Selected Categories */}
          <View className="flex-row flex-wrap mb-4">
            {(data.categories as string[] | undefined)?.map(
              (item: string) => (
                <View
                  key={item}
                  className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg mr-2 mb-2"
                >
                  <Text className="text-sm mr-2">{item}</Text>
                  <TouchableOpacity
                    onPress={() => removeCategory(item)}
                  >
                    <Ionicons name="close" size={14} />
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>

          {/* Category List */}
          <FlatList<string>
            data={filteredCategories}
            keyExtractor={(item: string) => item}
            renderItem={({ item }: { item: string }) => (
              <TouchableOpacity
                onPress={() => addCategory(item)}
                className="flex-row justify-between items-center bg-gray-100 px-4 py-3 rounded-lg mb-2"
              >
                <Text>{item}</Text>
                <Ionicons name="add" size={18} />
              </TouchableOpacity>
            )}
          />

          {/* Next Button */}
          <TouchableOpacity
            disabled={!isValid}
            onPress={() =>
              router.push("/Setup/business-setup/step-3")
            }
            className={`mt-6 py-4 rounded-lg items-center ${
              isValid ? "bg-red-600" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-medium">
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AnimatedStep>
  );
}
