// app/(customer)/product/[slug].tsx - UPDATED WITHOUT VENDOR VISIT
import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Heart,
    Star,
    Shield,
    Truck,
    RotateCcw,
    Image as ImageIcon,
    ChevronDown,
    ChevronUp,
} from "lucide-react-native";
import { colors } from "@/constants/color";
import { useLanguage } from "@/context/LanguageContext";
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';


// Define interfaces
interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string | null;
    icon: string;
    parent: string;
    children: any[];
    full_path: string;
    order: number;
    is_active: boolean;
    product_count: number;
    meta_title: string;
    meta_description: string;
    created_at: string;
    updated_at: string;
}

interface Brand {
    id: string;
    name: string;
    slug: string;
    description: string;
    logo: string | null;
    banner: string | null;
    website: string;
    is_active: boolean;
    product_count: number;
    created_at: string;
    updated_at: string;
}

interface Variant {
    id: string;
    sku: string;
    name: string;
    options: Record<string, string>;
    price_adjustment: string;
    final_price: string;
    stock_quantity: number;
    is_active: boolean;
    image: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

interface Attribute {
    id: string;
    name: string;
    value: string;
    order: number;
}

// VendorInfo interface from product API
interface VendorInfo {
    vendor_name: string;
    vendor_id: string;
    is_approved: boolean;
}

interface Product {
    id: string;
    product_type: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    short_description: string;
    category: Category;
    brand: Brand;
    tags: string[];
    price: string;
    compare_at_price: string | null;
    discount_percentage: number;
    stock_quantity: number;
    is_in_stock: boolean;
    is_low_stock: boolean;
    track_inventory: boolean;
    weight: string;
    length: string | null;
    width: string | null;
    height: string | null;
    condition: string;
    is_active: boolean;
    is_featured: boolean;
    requires_shipping: boolean;
    is_digital: boolean;
    images: any[];
    variants: Variant[];
    attributes: Attribute[];
    view_count: number;
    purchase_count: number;
    rating_average: string;
    rating_count: number;
    vendor_info: VendorInfo;
    dropship_info: any;
    meta_title: string;
    meta_description: string;
    created_at: string;
    updated_at: string;
    published_at: string;
}

interface ProductResponse {
    success: boolean;
    message: string;
    data: Product;
}

const ProductDetailsPage = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { t } = useLanguage();

    const slug = params.slug as string;
    const productName = params.productName as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showSpecifications, setShowSpecifications] = useState(true);
    const [showShippingInfo, setShowShippingInfo] = useState(false);

    // Format rating display
    const formatRating = useCallback((rating: string) => {
        const numRating = parseFloat(rating);
        return isNaN(numRating) ? "0.0" : numRating.toFixed(1);
    }, []);

    // Format price
    const formatPrice = (price: string | undefined | null) => {
        if (!price) return "₦0";
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return "₦0";
        return `₦${numPrice.toLocaleString('en-NG', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}`;
    };

    // Calculate discount percentage
    const calculateDiscount = (price: string, comparePrice: string | null) => {
        if (!comparePrice) return 0;
        const currentPrice = parseFloat(price);
        const originalPrice = parseFloat(comparePrice);
        if (isNaN(currentPrice) || isNaN(originalPrice) || originalPrice <= 0) return 0;
        const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
        return Math.round(discount);
    };

    // Fetch product details
    const fetchProductDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (!slug) {
                setError(t('product_not_found') || "Product not found");
                setLoading(false);
                return;
            }

            const response = await api.get<ProductResponse>(
                endpoints.productDetailsBySlug(slug)
            );

            if (response.data.success && response.data.data) {
                const productData = response.data.data;
                
                // Debug logging
                console.log("Product data received:", productData);
                console.log("Vendor info from API:", productData.vendor_info);
                
                setProduct(productData);

                // Set default variant (first variant or base product)
                if (productData.variants && productData.variants.length > 0) {
                    setSelectedVariant(productData.variants[0]);
                    // Extract options from first variant
                    const options: Record<string, string> = {};
                    if (productData.variants[0].options) {
                        Object.entries(productData.variants[0].options).forEach(([key, value]) => {
                            options[key] = value;
                        });
                    }
                    setSelectedOptions(options);
                }
            } else {
                setError(response.data.message || t('product_not_found') || "Product not found");
            }
        } catch (error: any) {
            console.error("Error fetching product details:", error);
            
            let errorMessage = t('failed_to_load_product') || "Failed to load product";
            
            if (error.response?.status === 404) {
                errorMessage = t('product_not_found') || "Product not found";
            } else if (error.response?.status === 401) {
                errorMessage = t('unauthorized_access') || "Unauthorized access";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [slug, t]);

    useEffect(() => {
        if (slug) {
            fetchProductDetails();
        }
    }, [fetchProductDetails, slug]);


    // Handle option selection for variants
    const handleOptionSelect = (optionType: string, optionValue: string) => {
        const newOptions = { ...selectedOptions, [optionType]: optionValue };
        setSelectedOptions(newOptions);

        // Find matching variant
        if (product?.variants) {
            const matchingVariant = product.variants.find(variant => {
                return Object.entries(newOptions).every(([key, value]) => {
                    const variantOption = variant.options?.[key];
                    return variantOption === value;
                });
            });

            if (matchingVariant) {
                setSelectedVariant(matchingVariant);
            }
        }
    };

    // Handle quantity changes
    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stock_quantity || product?.stock_quantity || 10)) {
            setQuantity(newQuantity);
        }
    };

    // Add to cart
    const handleAddToCart = () => {
        if (!product) return;

        const productToAdd = {
            id: product.id,
            name: product.name,
            price: selectedVariant ? parseFloat(selectedVariant.final_price) : parseFloat(product.price),
            quantity,
            variant: selectedVariant,
            options: selectedOptions
        };

        console.log("Adding to cart:", productToAdd);

        Alert.alert(
            t('added_to_cart') || "Added to Cart",
            `${product.name} has been added to your cart`,
            [{ text: "OK" }]
        );
    };

    // Toggle wishlist
    const handleToggleWishlist = () => {
        if (!product) return;

        setIsInWishlist(!isInWishlist);

        if (!isInWishlist) {
            console.log("Added to wishlist:", product.id);
            Alert.alert(
                t('added_to_wishlist') || "Added to Wishlist",
                `${product.name} has been added to your wishlist`
            );
        } else {
            console.log("Removed from wishlist:", product.id);
        }
    };

    // Buy now
    const handleBuyNow = () => {
        if (!product) return;

        handleAddToCart();
        // Navigate to checkout
        setTimeout(() => {
            router.push("/(customer)/cart");
        }, 500);
    };

    // Navigate to category
    const handleNavigateToCategory = () => {
        if (!product?.category?.slug) return;

        router.push({
            pathname: "/(customer)/category",
            params: { slug: product.category.slug }
        });
    };
    // Retry function
    const handleRetry = useCallback(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color={colors.darkRed} />
                <Text className="text-gray-500 text-sm mt-2">
                    {t('loading_product') || "Loading product details..."}
                </Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View className="flex-1 bg-white">
                <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft size={24} color={colors.darkRed} />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold ml-4">
                        {productName || t('product_details') || "Product Details"}
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center px-4">
                    <View className="items-center mb-6">
                        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <Text className="text-4xl">📦</Text>
                        </View>
                        <Text className="text-lg font-semibold text-gray-800 mb-2">
                            {t('product_not_found') || "Product not found"}
                        </Text>
                    </View>
                    
                    <Text className="text-red-500 text-base mb-6 text-center">
                        {error}
                    </Text>
                    
                    <View className="flex-row space-x-4">
                        <TouchableOpacity
                            className="flex-1 bg-darkRed px-6 py-3 rounded-lg"
                            onPress={handleRetry}
                        >
                            <Text className="text-white text-sm font-medium text-center">
                                {t('retry') || "Try Again"}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            className="flex-1 border border-gray-300 px-6 py-3 rounded-lg"
                            onPress={() => router.back()}
                        >
                            <Text className="text-gray-700 text-sm font-medium text-center">
                                {t('go_back') || "Go Back"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    const discount = calculateDiscount(product.price, product.compare_at_price);
    const hasDiscount = discount > 0;
    const isInStock = product.is_in_stock || false;
    const currentPrice = selectedVariant ? parseFloat(selectedVariant.final_price) : parseFloat(product.price);
    const displayPrice = selectedVariant ? selectedVariant.final_price : product.price;
    const maxQuantity = selectedVariant?.stock_quantity || product.stock_quantity || 10;
    const rating = formatRating(product.rating_average || "0");
    const ratingCount = product.rating_count || 0;

    // Get available options from variants
    const availableOptions: Record<string, string[]> = {};
    if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
            if (variant.options) {
                Object.entries(variant.options).forEach(([key, value]) => {
                    if (!availableOptions[key]) {
                        availableOptions[key] = [];
                    }
                    if (!availableOptions[key].includes(value)) {
                        availableOptions[key].push(value);
                    }
                });
            }
        });
    }

    // Use a safe blue color
    const safeBlueColor = 'blue' in colors ? colors.blue : "#3b82f6";

    return (
        <View className="flex-1 bg-white pt-6">
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                {/* Header with Back Button */}
                <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center px-4 py-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-white/80 p-2 rounded-full"
                    >
                        <ArrowLeft size={24} color={colors.darkRed} />
                    </TouchableOpacity>

                </View>

                {/* Product Image Placeholder */}
                <View className="relative">
                    <View className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
                        {/* No Image Text */}
                        <View className="absolute bottom-4 left-0 right-0 items-center">
                            <View className="flex-row items-center bg-black/60 rounded-full px-4 py-2">
                                <ImageIcon size={18} color="white" />
                                <Text className="text-white text-sm ml-2">
                                    {t('product_image_coming_soon') || 'Product images coming soon'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="absolute top-4 right-4 flex-row space-x-2">
                        <TouchableOpacity
                            className="bg-white/90 p-3 rounded-full shadow"
                            onPress={handleToggleWishlist}
                        >
                            <Heart
                                size={22}
                                color={isInWishlist ? colors.darkRed : "#666"}
                                fill={isInWishlist ? colors.darkRed : "none"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Product Info */}
                <View className="px-4 pt-6">
                    {/* Category Breadcrumb */}
                    <TouchableOpacity
                        className="mb-2"
                        onPress={handleNavigateToCategory}
                    >
                        <Text className="text-sm text-gray-500">
                            {product.category.full_path}
                        </Text>
                    </TouchableOpacity>

                    {/* Product Name */}
                    <Text className="text-2xl font-bold text-gray-800 mb-2">
                        {product.name}
                    </Text>

                    {/* Rating */}
                    <View className="flex-row items-center mb-3">
                        <View className="flex-row items-center mr-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={18}
                                    color={star <= Math.floor(parseFloat(rating)) ? "#FFD700" : "#E5E7EB"}
                                    fill={star <= Math.floor(parseFloat(rating)) ? "#FFD700" : "none"}
                                />
                            ))}
                        </View>
                        <Text className="text-gray-600 font-semibold mr-2">
                            {rating}
                        </Text>
                        <Text className="text-gray-500">
                            ({ratingCount} {t('reviews') || 'reviews'})
                        </Text>
                        <View className="h-4 w-px bg-gray-300 mx-3" />
                        <Text className="text-gray-500">
                            {product.view_count.toLocaleString()} {t('views') || 'views'}
                        </Text>
                    </View>

                    {/* Price Section */}
                    <View className="mb-4">
                        <View className="flex-row items-center">
                            <Text className="text-3xl font-bold text-darkRed mr-3">
                                {formatPrice(displayPrice)}
                            </Text>
                            {hasDiscount && product.compare_at_price && (
                                <Text className="text-lg text-gray-400 line-through">
                                    {formatPrice(product.compare_at_price)}
                                </Text>
                            )}
                        </View>
                        {hasDiscount && (
                            <Text className="text-sm text-green-600 font-medium mt-1">
                                You save {formatPrice((parseFloat(product.compare_at_price || "0") - currentPrice).toString())}
                            </Text>
                        )}
                    </View>

                    {/* Stock Status */}
                    <View className={`flex-row items-center p-3 rounded-lg mb-4 ${isInStock ? 'bg-green-50' : 'bg-red-50'}`}>
                        <View className={`w-3 h-3 rounded-full mr-2 ${isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className={isInStock ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                            {isInStock
                                ? `${t('in_stock') || 'In stock'} - ${maxQuantity} ${t('available') || 'available'}`
                                : t('out_of_stock') || 'Out of stock'
                            }
                        </Text>
                    </View>

                    {/* SKU & Brand */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-sm text-gray-500">
                                {t('sku') || 'SKU'}: {product.sku}
                            </Text>
                            <Text className="text-sm text-gray-500">
                                {t('brand') || 'Brand'}: {product.brand.name}
                            </Text>
                        </View>
                        {/* REMOVED VENDOR LINK - Just display vendor name as text */}
                        <View className="flex-row items-center">
                            <Text className="text-darkRed font-medium">
                                {product.vendor_info.vendor_name}
                            </Text>
                        </View>
                    </View>

                    {/* Variant Selection */}
                    {Object.keys(availableOptions).length > 0 && (
                        <View className="mb-6">
                            {Object.entries(availableOptions).map(([optionType, optionValues]) => (
                                <View key={optionType} className="mb-4">
                                    <Text className="font-medium text-gray-700 mb-2 capitalize">
                                        {optionType}:
                                    </Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {optionValues.map((value) => {
                                            const isSelected = selectedOptions[optionType] === value;
                                            return (
                                                <TouchableOpacity
                                                    key={value}
                                                    className={`px-4 py-2 rounded-lg border ${isSelected
                                                        ? 'border-darkRed bg-darkRed'
                                                        : 'border-gray-300 bg-white'
                                                        }`}
                                                    onPress={() => handleOptionSelect(optionType, value)}
                                                >
                                                    <Text className={isSelected ? 'text-white font-medium' : 'text-gray-700'}>
                                                        {value}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Quantity Selector */}
                    <View className="mb-6">
                        <Text className="font-medium text-gray-700 mb-2">
                            {t('quantity') || 'Quantity'}:
                        </Text>
                        <View className="flex-row items-center">
                            <TouchableOpacity
                                className="w-10 h-10 bg-gray-100 items-center justify-center rounded-l-lg"
                                onPress={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                            >
                                <Text className="text-xl text-gray-700">-</Text>
                            </TouchableOpacity>
                            <View className="w-16 h-10 bg-white border-y border-gray-300 items-center justify-center">
                                <Text className="text-lg font-semibold">{quantity}</Text>
                            </View>
                            <TouchableOpacity
                                className="w-10 h-10 bg-gray-100 items-center justify-center rounded-r-lg"
                                onPress={() => handleQuantityChange(1)}
                                disabled={quantity >= maxQuantity}
                            >
                                <Text className="text-xl text-gray-700">+</Text>
                            </TouchableOpacity>
                            <Text className="text-gray-500 text-sm ml-3">
                                {maxQuantity} {t('available') || 'available'}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row space-x-3 mb-8 gap-2">
                        <TouchableOpacity
                            className={`flex-1 py-4 rounded-xl items-center justify-center ${isInStock ? 'bg-darkRed' : 'bg-gray-300'}`}
                            onPress={handleAddToCart}
                            disabled={!isInStock}
                        >
                            <Text className="text-white text-lg font-semibold">
                                {t('add_to_cart') || 'Add to Cart'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-4 rounded-xl items-center justify-center border ${isInStock ? 'border-darkRed' : 'border-gray-300'}`}
                            onPress={handleBuyNow}
                            disabled={!isInStock}
                        >
                            <Text className={`text-lg font-semibold ${isInStock ? 'text-darkRed' : 'text-gray-500'}`}>
                                {t('buy_now') || 'Buy Now'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Product Features */}
                    <View className="flex-row flex-wrap justify-between mb-8">
                        <View className="items-center w-1/3 mb-4">
                            <Shield size={24} color={colors.darkRed} />
                            <Text className="text-sm font-medium mt-1 text-center">
                                {t('authentic') || '100% Authentic'}
                            </Text>
                        </View>
                        <View className="items-center w-1/3 mb-4">
                            <Truck size={24} color={colors.darkRed} />
                            <Text className="text-sm font-medium mt-1 text-center">
                                {t('free_shipping') || 'Free Shipping'}
                            </Text>
                        </View>
                        <View className="items-center w-1/3 mb-4">
                            <RotateCcw size={24} color={colors.darkRed} />
                            <Text className="text-sm font-medium mt-1 text-center">
                                {t('easy_returns') || 'Easy Returns'}
                            </Text>
                        </View>
                    </View>

                    {/* Description Section */}
                    <View className="mb-6">
                        <TouchableOpacity
                            className="flex-row justify-between items-center mb-3"
                            onPress={() => setShowFullDescription(!showFullDescription)}
                        >
                            <Text className="text-lg font-bold text-gray-800">
                                {t('description') || 'Description'}
                            </Text>
                            {showFullDescription ? (
                                <ChevronUp size={20} color="#666" />
                            ) : (
                                <ChevronDown size={20} color="#666" />
                            )}
                        </TouchableOpacity>

                        <Text
                            className="text-gray-600 leading-relaxed"
                            numberOfLines={showFullDescription ? undefined : 3}
                        >
                            {product.description}
                        </Text>

                        {!showFullDescription && product.description.length > 150 && (
                            <TouchableOpacity onPress={() => setShowFullDescription(true)}>
                                <Text className="text-darkRed font-medium mt-2">
                                    {t('read_more') || 'Read more'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Specifications/Attributes */}
                    {product.attributes && product.attributes.length > 0 && (
                        <View className="mb-6">
                            <TouchableOpacity
                                className="flex-row justify-between items-center mb-3"
                                onPress={() => setShowSpecifications(!showSpecifications)}
                            >
                                <Text className="text-lg font-bold text-gray-800">
                                    {t('specifications') || 'Specifications'}
                                </Text>
                                {showSpecifications ? (
                                    <ChevronUp size={20} color="#666" />
                                ) : (
                                    <ChevronDown size={20} color="#666" />
                                )}
                            </TouchableOpacity>

                            {showSpecifications && (
                                <View className="bg-gray-50 rounded-xl p-4">
                                    {product.attributes.map((attr) => (
                                        <View key={attr.id} className="flex-row justify-between py-2 border-b border-gray-200 last:border-b-0">
                                            <Text className="text-gray-600 font-medium">{attr.name}:</Text>
                                            <Text className="text-gray-800">{attr.value}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Shipping Information */}
                    <View className="mb-6">
                        <TouchableOpacity
                            className="flex-row justify-between items-center mb-3"
                            onPress={() => setShowShippingInfo(!showShippingInfo)}
                        >
                            <Text className="text-lg font-bold text-gray-800">
                                {t('shipping_info') || 'Shipping Information'}
                            </Text>
                            {showShippingInfo ? (
                                <ChevronUp size={20} color="#666" />
                            ) : (
                                <ChevronDown size={20} color="#666" />
                            )}
                        </TouchableOpacity>

                        {showShippingInfo && (
                            <View className="bg-gray-50 rounded-xl p-4">
                                <View className="flex-row items-center mb-3">
                                    <Truck size={20} color={colors.darkRed} />
                                    <Text className="font-medium ml-2">
                                        {t('estimated_delivery') || 'Estimated Delivery'}
                                    </Text>
                                </View>
                                <Text className="text-gray-600 mb-2">
                                    • {t('delivery_time_3_7') || '3-7 business days'}
                                </Text>
                                <Text className="text-gray-600 mb-2">
                                    • {t('free_shipping_over') || 'Free shipping on orders over ₦50,000'}
                                </Text>
                                <Text className="text-gray-600">
                                    • {t('tracking_available') || 'Tracking number provided'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                        <View className="mb-8">
                            <Text className="text-lg font-bold text-gray-800 mb-3">
                                {t('tags') || 'Tags'}
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {product.tags.map((tag) => (
                                    <TouchableOpacity
                                        key={tag}
                                        className="bg-gray-100 px-3 py-1.5 rounded-full"
                                    >
                                        <Text className="text-gray-700 text-sm">{tag}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Safety Note */}
                    <View className="bg-blue-50 p-4 rounded-xl mb-8">
                        <View className="flex-row items-center mb-2">
                            <Shield size={20} color={safeBlueColor} />
                            <Text className="font-semibold text-blue-800 ml-2">
                                {t('safe_shopping') || 'Safe Shopping Guarantee'}
                            </Text>
                        </View>
                        <Text className="text-blue-700 text-sm">
                            {t('safe_shopping_description') || 'Your payment information is encrypted and secure. We never share your details with third parties.'}
                        </Text>
                    </View>
                </View>

                {/* Bottom Spacer */}
                <View className="h-24" />
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <View className="flex-row space-x-3 gap-2">
                    <TouchableOpacity
                        className="w-12 h-12 bg-gray-100 items-center justify-center rounded-xl"
                        onPress={handleToggleWishlist}
                    >
                        <Heart
                            size={24}
                            color={isInWishlist ? colors.darkRed : "#666"}
                            fill={isInWishlist ? colors.darkRed : "none"}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-darkRed py-3 rounded-xl items-center justify-center"
                        onPress={handleBuyNow}
                        disabled={!isInStock}
                    >
                        <Text className="text-white text-lg font-semibold">
                            {t('buy_now') || 'Buy Now'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default ProductDetailsPage;