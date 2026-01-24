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
import { useLanguage } from "@/context/LanguageContext";

// Categories with translations
const CATEGORIES = [
  { key: "health_beauty", en: "Health & Beauty", fr: "Santé & Beauté", es: "Salud y Belleza", pt: "Saúde e Beleza" },
  { key: "fashion_apparel", en: "Fashion & Apparel", fr: "Mode & Vêtements", es: "Moda y Ropa", pt: "Moda e Vestuário" },
  { key: "electronics_gadgets", en: "Electronics & Gadgets", fr: "Électronique & Gadgets", es: "Electrónica y Gadgets", pt: "Eletrônicos e Gadgets" },
  { key: "home_kitchen", en: "Home & Kitchen", fr: "Maison & Cuisine", es: "Hogar y Cocina", pt: "Casa e Cozinha" },
  { key: "baby_pet_supplies", en: "Baby & Pet Supplies", fr: "Bébé & Fournitures pour animaux", es: "Bebé y Suministros para Mascotas", pt: "Bebê e Suprimentos para Pets" },
  { key: "hobbies_entertainment", en: "Hobbies & Entertainment", fr: "Loisirs & Divertissement", es: "Pasatiempos y Entretenimiento", pt: "Hobbies e Entretenimento" },
  { key: "sports_outdoors", en: "Sports & Outdoors", fr: "Sports & Plein air", es: "Deportes y Aire Libre", pt: "Esportes e Ar Livre" },
  { key: "food_beverages", en: "Food & Beverages", fr: "Nourriture & Boissons", es: "Alimentos y Bebidas", pt: "Alimentos e Bebidas" },
  { key: "books_stationery", en: "Books & Stationery", fr: "Livres & Papeterie", es: "Libros y Papelería", pt: "Livros e Papelaria" },
  { key: "automotive", en: "Automotive", fr: "Automobile", es: "Automotriz", pt: "Automotivo" },
];

export default function Step2() {
  const router = useRouter();
  const { data, update } = useSetup();
  const { t, language } = useLanguage();

  const [search, setSearch] = useState<string>("");

  // Get translated category label
  const getCategoryLabel = (category: typeof CATEGORIES[0]) => {
    if (
      language &&
      typeof language === "string" &&
      language in category
    ) {
      return category[language as keyof typeof category];
    }

    return category.en;
  };


  // Get category by key
  const getCategoryByKey = (key: string) => {
    return CATEGORIES.find(cat => cat.key === key);
  };

  const filteredCategories = useMemo(() => {
    const selected = (data.categories ?? []) as string[];
    return CATEGORIES.filter((category) => {
      const label = getCategoryLabel(category);
      return (
        label.toLowerCase().includes(search.toLowerCase()) &&
        !selected.includes(category.key)
      );
    });
  }, [search, data.categories, language]);

  const addCategory = (categoryKey: string) => {
    const currentCategories = [...((data.categories ?? []) as string[])];
    if (!currentCategories.includes(categoryKey)) {
      update({
        categories: [...currentCategories, categoryKey],
      });
    }
  };

  const removeCategory = (categoryKey: string) => {
    update({
      categories: ((data.categories ?? []) as string[]).filter(
        (c: string) => c !== categoryKey
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
              className="absolute left-0 top-2 p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color="#000" />
            </TouchableOpacity>

            <Text className="font-semibold text-base mt-3">
              {t('welcome_user', { name: data.firstName || t('user') })}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              {t('setup_business_profile')}
            </Text>
          </View>

          {/* Step Indicator */}
          <StepIndicator totalSteps={3} currentStep={2} />

          {/* Business Type */}
          <Text className="font-medium text-black mb-4 text-center">
            {t('business_type')}
          </Text>

          {/* Business Name */}
          <Text className="text-xs text-gray-400 mb-1">
            {t('business_name')} *
          </Text>
          <TextInput
            placeholder={t('enter_business_name')}
            value={data.businessName ?? ""}
            onChangeText={(v: string) => update({ businessName: v })}
            className="border-b py-2 mb-5"
            maxLength={100}
          />

          {/* Categories */}
          <Text className="text-xs text-gray-400 mb-2">
            {t('product_categories')} *
          </Text>

          {/* Search */}
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 mb-3">
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              placeholder={t('search_categories')}
              value={search}
              onChangeText={setSearch}
              className="flex-1 ml-2"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* Selected Categories */}
          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-2">
              {t('selected_categories')} ({((data.categories ?? []) as string[]).length})
            </Text>
            <View className="flex-row flex-wrap">
              {(data.categories as string[] | undefined)?.map(
                (categoryKey: string) => {
                  const category = getCategoryByKey(categoryKey);
                  if (!category) return null;

                  return (
                    <View
                      key={category.key}
                      className="flex-row items-center bg-red-50 border border-red-200 px-3 py-2 rounded-full mr-2 mb-2"
                    >
                      <Text className="text-sm text-red-700 mr-2">
                        {getCategoryLabel(category)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeCategory(category.key)}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      >
                        <Ionicons name="close-circle" size={16} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  );
                }
              )}

              {((data.categories ?? []) as string[]).length === 0 && (
                <Text className="text-gray-400 text-sm">
                  {t('no_categories_selected')}
                </Text>
              )}
            </View>
          </View>

          {/* Available Categories */}
          <View className="mb-2">
            <Text className="text-xs text-gray-500 mb-2">
              {t('available_categories')} ({filteredCategories.length})
            </Text>

            {filteredCategories.length === 0 ? (
              <View className="bg-gray-50 rounded-lg items-center">
                <Ionicons name="search-outline" size={32} color="#9ca3af" />
                <Text className="text-gray-500 mt-2">
                  {search ? t('no_categories_found') : t('all_categories_selected')}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredCategories}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => addCategory(item.key)}
                    className="flex-row justify-between items-center bg-gray-50 px-4 py-3 rounded-lg mb-2 active:bg-gray-100"
                  >
                    <Text className="text-gray-800">{getCategoryLabel(item)}</Text>
                    <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            disabled={!isValid}
            onPress={() => router.push("/Setup/business-setup/step-3")}
            className={`py-4 rounded-lg items-center ${isValid ? "bg-red-600" : "bg-gray-300"
              }`}
          >
            <Text className="text-white font-medium">
              {t('next')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AnimatedStep>
  );
}