// Step2.tsx - Updated with access token handling
import { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AnimatedStep from "@/components/AnimatedStep";
import StepIndicator from "@/components/StepIndicator";
import { useSetup } from "@/context/VendorApplicationContext";
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
  const [isLoading, setIsLoading] = useState(true);
  const [tokenVerified, setTokenVerified] = useState(false);

  // ✅ NEW: Verify access token on mount
  useEffect(() => {
    const verifyTokenAndLoadData = async () => {
      try {
        console.log('🔐 Step2: Verifying access token...');

        // Check if token exists in AsyncStorage
        const accessToken = await AsyncStorage.getItem('authToken');
        
        if (!accessToken) {
          console.error('❌ No access token found in AsyncStorage');
          Alert.alert(
            t('session_expired') || 'Session Expired',
            t('please_login_again') || 'Please login again to continue.',
            [
              {
                text: t('login') || 'Login',
                onPress: () => router.replace('/signIn'),
              },
            ]
          );
          setIsLoading(false);
          return;
        }

        console.log('✅ Access token verified in Step2');
        setTokenVerified(true);

        // Load saved setup data
        const savedData = await AsyncStorage.getItem('setupData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          // Update context with saved data
          if (parsedData.businessName && !data.businessName) {
            update({ businessName: parsedData.businessName });
          }
          if (parsedData.categories && !data.categories) {
            update({ categories: parsedData.categories });
          }
          
          console.log('✅ Loaded saved setup data in Step2');
        }

      } catch (error) {
        console.error('❌ Error verifying token in Step2:', error);
        Alert.alert(
          t('error') || 'Error',
          t('failed_to_verify_session') || 'Failed to verify session. Please try again.',
          [
            {
              text: t('retry') || 'Retry',
              onPress: () => verifyTokenAndLoadData(),
            },
            {
              text: t('login') || 'Login',
              onPress: () => router.replace('/signIn'),
              style: 'cancel',
            },
          ]
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyTokenAndLoadData();
  }, []);

  // Get translated category label
  const getCategoryLabel = (category: typeof CATEGORIES[0]) => {
    if (language && typeof language === "string" && language in category) {
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

  const addCategory = async (categoryKey: string) => {
    const currentCategories = [...((data.categories ?? []) as string[])];
    if (!currentCategories.includes(categoryKey)) {
      const updatedCategories = [...currentCategories, categoryKey];
      await update({
        categories: updatedCategories,
      });
    }
  };

  const removeCategory = async (categoryKey: string) => {
    const updatedCategories = ((data.categories ?? []) as string[]).filter(
      (c: string) => c !== categoryKey
    );
    await update({
      categories: updatedCategories,
    });
  };

  // Validation
  const isBusinessNameValid = Boolean(data.businessName) && (data.businessName || '').length >= 2;
  const isCategoriesValid = Array.isArray(data.categories) && data.categories.length > 0;
  const isValid = isBusinessNameValid && isCategoriesValid && tokenVerified;

  const handleNext = async () => {
    if (!tokenVerified) {
      Alert.alert(
        t('session_error') || 'Session Error',
        t('please_restart_setup') || 'Please restart the setup process.'
      );
      return;
    }

    if (!isValid) {
      if (!isBusinessNameValid) {
        alert(t('enter_valid_business_name'));
        return;
      }
      if (!isCategoriesValid) {
        alert(t('select_at_least_one_category'));
        return;
      }
      return;
    }

    // Save data before proceeding
    const updatedData = {
      businessName: data.businessName,
      categories: data.categories,
    };
    
    await update(updatedData);
    
    // Also save to AsyncStorage
    try {
      const existingData = await AsyncStorage.getItem('setupData');
      const mergedData = existingData 
        ? { ...JSON.parse(existingData), ...updatedData }
        : updatedData;
      await AsyncStorage.setItem('setupData', JSON.stringify(mergedData));
      console.log('✅ Step2 data saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }

    // Proceed to next step (no need to pass token - it's in AsyncStorage)
    router.push("/Setup/business-setup/step-3");
  };

  const handleBack = async () => {
    // Save current data before going back
    try {
      const currentData = {
        businessName: data.businessName,
        categories: data.categories,
      };
      
      const existingData = await AsyncStorage.getItem('setupData');
      const mergedData = existingData 
        ? { ...JSON.parse(existingData), ...currentData }
        : currentData;
      await AsyncStorage.setItem('setupData', JSON.stringify(mergedData));
      console.log('✅ Step2 data saved before going back');
    } catch (error) {
      console.error('Error saving data before back:', error);
    }
    
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="lock-closed" size={48} color="#9ca3af" />
          <Text className="text-gray-500 mt-4">{t('verifying_session') || 'Verifying session...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tokenVerified) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text className="text-xl font-semibold text-gray-800 mt-4 text-center">
            {t('session_expired') || 'Session Expired'}
          </Text>
          <Text className="text-gray-600 mt-2 text-center">
            {t('please_login_again') || 'Please login again to continue.'}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/signIn')}
            className="mt-6 bg-red-600 px-8 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">{t('login') || 'Login'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AnimatedStep>
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 pt-4 flex-1">
          {/* Header */}
          <View className="items-center mb-4 relative">
            <View className="w-20 h-20 items-center justify-center mx-auto mb-4">
              <Image
                source={require("@/assets/icons/setupIcon.png")}
                className="w-24 h-24"
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity
              onPress={handleBack}
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
            {t('business_type')} ({t('step')} 2/3)
          </Text>

          {/* Business Name */}
          <View className="mb-5">
            <Text className="text-xs text-gray-400 mb-1">
              {t('business_name')} *
            </Text>
            <TextInput
              placeholder={t('enter_business_name')}
              value={data.businessName ?? ""}
              onChangeText={(v: string) => update({ businessName: v })}
              className={`border-b py-2 ${isBusinessNameValid ? 'border-gray-300' : 'border-red-500'}`}
              maxLength={100}
            />
            {!isBusinessNameValid && data.businessName && (
              <Text className="text-xs text-red-500 mt-1">
                {t('enter_valid_business_name')}
              </Text>
            )}
          </View>

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
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs text-gray-500">
                {t('selected_categories')} ({((data.categories ?? []) as string[]).length})
              </Text>
              {!isCategoriesValid && (
                <Text className="text-xs text-red-500">
                  {t('select_at_least_one_category')}
                </Text>
              )}
            </View>
            <View className="flex-row flex-wrap min-h-[40px]">
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
                  {t('no_categories_selected_yet')}
                </Text>
              )}
            </View>
          </View>

          {/* Available Categories */}
          <View className="mb-2 flex-1">
            <Text className="text-xs text-gray-500 mb-2">
              {t('available_categories')} ({filteredCategories.length})
            </Text>

            {filteredCategories.length === 0 ? (
              <View className="bg-gray-50 rounded-lg items-center py-8">
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
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>

          {/* Navigation Buttons */}
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity
              onPress={handleBack}
              className="flex-1 border border-gray-300 py-4 rounded-lg items-center"
            >
              <Text className="text-gray-700 font-medium">
                ← {t('back')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!isValid}
              onPress={handleNext}
              className={`flex-1 py-4 rounded-lg items-center ${isValid ? "bg-red-600" : "bg-gray-300"
                }`}
            >
              <Text className="text-white font-medium">
                {t('next_to_documents')} →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Info */}
          <Text className="text-xs text-gray-400 text-center">
            {t('step_of', { current: 2, total: 3 })}
          </Text>
          <Text className="text-xs text-gray-500 text-center mt-1">
            {t('next_step_documents')}
          </Text>
        </View>
      </SafeAreaView>
    </AnimatedStep>
  );
}