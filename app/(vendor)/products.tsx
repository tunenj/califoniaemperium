import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import { useLanguage } from '@/context/LanguageContext'; // Add import

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 40) / 2; // tighter spacing like screenshot

type Product = {
    id: string;
    name: string;
    price: string;
    stock: number;
    image: any;
};

const mockProducts: Product[] = [
    {
        id: '1',
        name: 'REDMI Note',
        price: '₦48,000',
        stock: 45,
        image: require('../../assets/images/redmi-phone.png'), // Replace with your actual image import
    },
    {
        id: '2',
        name: 'Burner',
        price: '₦42,000',
        stock: 4,
        image: require('../../assets/images/burner.png'),
    },
    {
        id: '3',
        name: 'Laptop',
        price: '₦48,000',
        stock: 42,
        image: require('../../assets/images/laptop.png'),
    },
    {
        id: '4',
        name: 'Monitor',
        price: '₦42,000',
        stock: 5,
        image: require('../../assets/images/monitor.png'),
    },
    {
        id: '5',
        name: 'Sneakers',
        price: '₦48,000',
        stock: 42,
        image: require('../../assets/images/sneakers.png'),
    },
    {
        id: '6',
        name: 'Handbag',
        price: '₦42,000',
        stock: 5,
        image: require('../../assets/images/handbag.png'),
    },
    {
        id: '7',
        name: 'Heels',
        price: '₦48,000',
        stock: 42,
        image: require('../../assets/images/heels.png'),
    },
    {
        id: '8',
        name: 'Dress',
        price: '₦42,000',
        stock: 5,
        image: require('../../assets/images/cloth.png'),
    },
];

const ProductsScreen: React.FC = () => {
    const { t } = useLanguage(); // Add hook

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={{ width: ITEM_WIDTH }}
            className="bg-white rounded-xl p-3 mb-4 border border-gray-200"
            activeOpacity={0.85}
        >
            <Image
                source={item.image}
                className="w-full h-32 rounded-lg mb-3"
                resizeMode="contain"
            />

            <View className="flex-row justify-between items-center mb-1">
                <Text
                    className="text-xs text-gray-600 flex-1 pr-2"
                    numberOfLines={2}
                >
                    {item.name}
                </Text>

                <View className="bg-green-100 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] text-green-600 font-semibold">
                        {t('active')}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between items-center mt-1">
                <Text className="text-sm font-semibold text-gray-900">
                    {item.price}
                </Text>
                <Text className="text-xs text-gray-500">
                    {item.stock} {t('in_stock')}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-4 pt-4 pb-3">
                <View className="flex-row justify-between items-center mb-3">
                    <View>
                        <Text className="text-lg font-bold text-gray-900">
                            {t('products')}
                        </Text>
                        <Text className="text-xs text-gray-500">
                            {mockProducts.length} {t('products_in_your_store')}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push("/Products/addProductScreen")}
                        className="bg-white border border-red-500 px-4 py-2 rounded-full"
                    >
                        <Text className="text-red-500 text-xs font-semibold">
                            + {t('add_product')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View className="bg-white rounded-xl px-4 py-1 border border-gray-200 mb-3">
                    <TextInput
                        placeholder={t('search_products')}
                        placeholderTextColor="#9CA3AF"
                        className="text-sm text-gray-800"
                    />
                </View>

                {/* Filters */}
                <View className="flex-row gap-3">
                    <TouchableOpacity className="flex-row items-center justify-between flex-1 bg-white px-4 py-3 rounded-xl border border-gray-200">
                        <Text className="text-xs text-gray-700">{t('all_categories')}</Text>
                        <Text className="text-xs text-gray-400">⌄</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between flex-1 bg-white px-4 py-3 rounded-xl border border-gray-200">
                        <Text className="text-xs text-gray-700">{t('all_status')}</Text>
                        <Text className="text-xs text-gray-400">⌄</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Product Grid */}
            <View className="px-4 flex-1 bg-orange-50 pt-2 border border-orange-300 rounded-xl">
                <FlatList
                    data={mockProducts}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
};

export default ProductsScreen;