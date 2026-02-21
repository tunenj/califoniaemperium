// app/(customer)/image-search.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Linking,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useExploreSearch } from '@/context/ExploreSearchContext';

const { width } = Dimensions.get('window');

// Helper function to format price
const formatPrice = (price: string) => {
  const numPrice = parseFloat(price);
  return `$${numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Product Card Component - iOS optimized
const ProductCard = ({ item }: { item: any }) => {
  const router = useRouter();
  
  // iOS specific shadow
  const iosShadow = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
  });

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(customer)/product/${item.slug}`)}
      className="bg-white rounded-2xl p-4 mb-4 border border-gray-100"
      activeOpacity={0.7}
      style={iosShadow}
    >
      <View className="flex-row">
        <View className="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
          {item.main_image ? (
            <Image source={{ uri: item.main_image }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <MaterialIcons name="image-not-supported" size={30} color="#9CA3AF" />
            </View>
          )}
          <View className="absolute top-1 left-1 bg-blue-600 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">
              {Math.round(item.similarity_score * 100)}%
            </Text>
          </View>
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
            {item.name}
          </Text>
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="category" size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1" numberOfLines={1}>
              {item.category_name}
            </Text>
          </View>
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-xl font-extrabold text-red-600">{formatPrice(item.price)}</Text>
              {item.compare_at_price && (
                <Text className="text-xs text-gray-400 line-through">
                  {formatPrice(item.compare_at_price)}
                </Text>
              )}
            </View>
            <View className={`px-2 py-1 rounded-full ${item.is_in_stock ? 'bg-green-50' : 'bg-red-50'}`}>
              <Text className={`text-xs font-medium ${item.is_in_stock ? 'text-green-600' : 'text-red-600'}`}>
                {item.is_in_stock ? '✓ In Stock' : '× Out of Stock'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Empty State Component - iOS optimized
const EmptyState = ({ icon, title, message, buttonText, onPress }: any) => (
  <View className="py-16 items-center px-6">
    <View className="w-24 h-24 bg-gray-50 rounded-full items-center justify-center mb-4">{icon}</View>
    <Text className="text-xl font-bold text-gray-900 text-center mb-2">{title}</Text>
    <Text className="text-gray-500 text-center mb-6">{message}</Text>
    {buttonText && onPress && (
      <TouchableOpacity 
        onPress={onPress} 
        className="bg-red-500 px-8 py-3 rounded-xl" 
        activeOpacity={0.8}
        style={Platform.select({
          ios: {
            shadowColor: '#B13239',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          },
        })}
      >
        <Text className="text-white font-semibold text-base">{buttonText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default function ImageSearch() {
  const {
    imageSearchImage,
    setImageSearchImage,
    imageSearchResults,
    setImageSearchResults,
    isImageSearching,
    setIsImageSearching,
    clearImageSearch,
    setSearchType,
  } = useExploreSearch();

  const router = useRouter();
  const isPickerOpen = useRef(false);
  const [isIosSafeArea, setIsIosSafeArea] = useState(Platform.OS === 'ios');

  // ── Open Settings helper ────────────────────────────────────────────────
  const openSettings = () =>
    Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings();

  // ── Recover photo if Android killed MainActivity during camera session ──
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const recoverPending = async () => {
      try {
        const pending = await ImagePicker.getPendingResultAsync();
        const result = Array.isArray(pending) ? pending[0] : pending;
        if (result && !result.canceled && result.assets?.[0]?.uri) {
          setImageSearchImage(result.assets[0].uri);
          setImageSearchResults([]);
          setSearchType('image');
        }
      } catch (_) {
        // No pending result — normal
      }
    };
    recoverPending();
  }, []);

  // ── Gallery ─────────────────────────────────────────────────────────────
  const pickImage = async () => {
    if (isPickerOpen.current) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant gallery access to select an image.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSettings },
        ]);
        return;
      }

      isPickerOpen.current = true;

      // FIXED: Removed presentationStyle property as it's causing type issues
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS === 'ios', // iOS can handle editing, Android crashes
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageSearchImage(result.assets[0].uri);
        setImageSearchResults([]);
        setSearchType('image');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    } finally {
      setTimeout(() => {
        isPickerOpen.current = false;
      }, 800);
    }
  };

  // ── Camera ──────────────────────────────────────────────────────────────
  const takePhoto = async () => {
    if (isPickerOpen.current) return;

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is required. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openSettings },
          ]
        );
        return;
      }

      isPickerOpen.current = true;

      // FIXED: Removed presentationStyle property as it's causing type issues
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS === 'ios', // iOS can handle editing, Android crashes
        quality: 0.8,
        cameraType: ImagePicker.CameraType.back,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageSearchImage(result.assets[0].uri);
        setImageSearchResults([]);
        setSearchType('image');
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      const msg = error?.message?.toLowerCase() ?? '';
      if (msg.includes('cancel') || msg.includes('user cancelled')) return;

      Alert.alert('Camera Unavailable', 'Could not open camera. Try using the gallery instead.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Gallery', onPress: pickImage },
      ]);
    } finally {
      setTimeout(() => {
        isPickerOpen.current = false;
      }, 800);
    }
  };

  // ── Search ──────────────────────────────────────────────────────────────
  const searchByImage = async () => {
    if (!imageSearchImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }
    setIsImageSearching(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const uriParts = imageSearchImage.split('.');
      const fileExtension = uriParts[uriParts.length - 1] || 'jpg';
      const mimeType = fileExtension.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';

      const formData = new FormData();
      formData.append('image', {
        uri: imageSearchImage,
        type: mimeType,
        name: `search-image.${fileExtension}`,
      } as any);

      const response = await api.post<{ success: boolean; message: string; data: any[] }>(
        endpoints.searchItem,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token ? `Bearer ${token}` : '',
          },
          timeout: 30000,
        }
      );

      if (response.data.success) {
        setImageSearchResults(response.data.data);
      } else {
        Alert.alert('Search Failed', response.data.message || 'No similar products found');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      let errorMessage = 'Failed to search by image. Please try again.';
      if (error.code === 'ECONNABORTED') errorMessage = 'Request timed out. Check your internet connection.';
      else if (error.response?.status === 413) errorMessage = 'Image is too large. Please choose a smaller image.';
      else if (error.response?.status === 415) errorMessage = 'Unsupported image format. Use JPEG or PNG.';
      else if (!error.response) errorMessage = 'Network error. Check your internet connection.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsImageSearching(false);
    }
  };

  // ── Clear and allow re-snap ─────────────────────────────────────────────
  const handleClear = () => {
    isPickerOpen.current = false;
    clearImageSearch();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      
      {/* iOS Safe Area handling */}
      {Platform.OS === 'ios' && <SafeAreaView className="bg-[#B13239]" />}
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#B13239', '#4D0812']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingTop: Platform.OS === 'ios' ? 0 : 48 }}
      >
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity
            onPress={() => router.push('/(customer)/explore')}
            className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View className="flex-row items-center">
            <MaterialIcons name="camera-alt" size={24} color="white" />
            <Text className="text-xl font-bold text-white ml-2" style={{ includeFontPadding: false }}>
              Search by Image
            </Text>
          </View>
          
          <View className="w-10" />
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        bounces={true}
      >
        <View className="px-4 py-6">
          {/* Image Selection Area */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3" style={{ includeFontPadding: false }}>
              {imageSearchImage ? 'Selected Image' : 'Choose an Image'}
            </Text>

            <View
              className={`bg-gray-50 rounded-2xl p-6 items-center border-2 ${
                imageSearchImage ? 'border-red-200' : 'border-gray-200 border-dashed'
              }`}
              style={Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                },
              })}
            >
              {imageSearchImage ? (
                <View className="w-full">
                  <Image
                    source={{ uri: imageSearchImage }}
                    className="w-full h-56 rounded-xl"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={handleClear}
                    className="absolute -top-3 -right-3 bg-red-500 rounded-full p-2 shadow-lg"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={Platform.select({
                      ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                      },
                    })}
                  >
                    <Ionicons name="close" size={18} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="py-8 items-center">
                  <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4">
                    <MaterialIcons name="add-photo-alternate" size={36} color="#B13239" />
                  </View>
                  <Text className="text-gray-600 text-center text-base font-medium">
                    Select an image to search
                  </Text>
                  <Text className="text-gray-400 text-center text-sm mt-1">for similar products</Text>
                </View>
              )}
            </View>

            {/* Picker Buttons */}
            {!imageSearchImage && (
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={pickImage}
                  className="flex-1 bg-red-50 py-4 rounded-xl flex-row items-center justify-center border border-red-200"
                  activeOpacity={0.7}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <MaterialIcons name="photo-library" size={22} color="#B13239" />
                  <Text className="text-red-600 font-semibold ml-2">Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={takePhoto}
                  className="flex-1 bg-red-50 py-4 rounded-xl flex-row items-center justify-center border border-red-200"
                  activeOpacity={0.7}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <MaterialIcons name="camera-alt" size={22} color="#B13239" />
                  <Text className="text-red-600 font-semibold ml-2">Camera</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Search Button */}
            {imageSearchImage && !imageSearchResults.length && (
              <TouchableOpacity
                onPress={searchByImage}
                disabled={isImageSearching}
                className="mt-4 bg-red-600 py-4 rounded-xl"
                style={Platform.select({
                  ios: {
                    shadowColor: '#B13239',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  },
                  android: {
                    elevation: 5,
                  },
                })}
                activeOpacity={0.8}
              >
                {isImageSearching ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold ml-2">Searching...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-center">
                    <MaterialIcons name="search" size={22} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Find Similar Products</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Retake button */}
            {imageSearchImage && !imageSearchResults.length && (
              <TouchableOpacity
                onPress={handleClear}
                className="mt-3 py-3 rounded-xl flex-row items-center justify-center"
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="camera-alt" size={18} color="#9CA3AF" />
                <Text className="text-gray-400 font-medium ml-2">Retake / Choose different image</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Results */}
          {imageSearchResults.length > 0 && (
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <MaterialIcons name="search" size={20} color="#B13239" />
                  <Text className="text-xl font-bold text-gray-900 ml-2" style={{ includeFontPadding: false }}>
                    Similar Products
                  </Text>
                </View>
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-sm text-gray-600 font-medium">
                    {imageSearchResults.length} found
                  </Text>
                </View>
              </View>
              {imageSearchResults.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}

              {/* Try another image after results */}
              <TouchableOpacity
                onPress={handleClear}
                className="mt-2 mb-4 py-3 rounded-xl flex-row items-center justify-center border border-gray-200"
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="camera-alt" size={18} color="#9CA3AF" />
                <Text className="text-gray-500 font-medium ml-2">Search with a different image</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading */}
          {isImageSearching && imageSearchResults.length === 0 && (
            <View className="py-16 items-center">
              <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4">
                <ActivityIndicator size="large" color="#B13239" />
              </View>
              <Text className="text-gray-700 text-lg font-semibold mb-1" style={{ includeFontPadding: false }}>
                Searching...
              </Text>
              <Text className="text-gray-400">Finding similar products for you</Text>
            </View>
          )}

          {/* No Results */}
          {imageSearchImage && !isImageSearching && imageSearchResults.length === 0 && (
            <EmptyState
              icon={<MaterialIcons name="search-off" size={48} color="#9CA3AF" />}
              title="No Matches Found"
              message="We couldn't find any products similar to your image. Try a different photo."
              buttonText="Try Another Image"
              onPress={handleClear}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}