// app/(customer)/product/[slug].tsx - COMPLETE WITH OPTIMIZED IMAGE LOADING AND QUANTITY-BASED PRICING
import React, { useEffect, useState, useCallback, memo, useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/constants/color";
import { useLanguage } from "@/context/LanguageContext";
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

// ✅ OPTIMIZED: Memoized Product Image Component
const ProductImage = memo(({ uri }: { uri: string | null }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    if (!uri || imageError) {
        return (
            <View className="w-full h-full items-center justify-center bg-gray-100">
                <MaterialIcons name="image" size={60} color="#9CA3AF" />
                <Text className="text-sm text-gray-400 mt-2">No image available</Text>
            </View>
        );
    }

    return (
        <>
            {imageLoading && (
                <View className="absolute inset-0 items-center justify-center bg-gray-100 z-10">
                    <ActivityIndicator size="large" color="#DC2626" />
                </View>
            )}
            <Image
                source={{ uri }}
                className="w-full h-full"
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={(error) => {
                    console.error('Image load error:', error.nativeEvent.error);
                    setImageError(true);
                    setImageLoading(false);
                }}
                fadeDuration={300}
            />
        </>
    );
});

ProductImage.displayName = 'ProductImage';

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

interface VendorInfo {
    vendor_name: string;
    vendor_id: string;
    is_approved: boolean;
}

interface ProductImageType {
    id: string;
    image: string;
    alt_text: string;
    is_primary: boolean;
    order: number;
    created_at: string;
}

interface Product {
    id: string;
    product_type: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    short_description: string;
    category: Category | null;
    brand: Brand | null;
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
    images: ProductImageType[];
    main_image?: string | null;
    variants: Variant[];
    attributes: Attribute[];
    view_count: number;
    purchase_count: number;
    rating_average: string;
    rating_count: number;
    vendor_info: VendorInfo | null;
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

// Define return types for cart operations
interface CartOperationResult {
    success: boolean;
    message?: string;
    error?: string;
}

const ProductDetailsPage = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { t } = useLanguage();
    const { addItem, isInCart, getItemCount } = useCart();
    const { addToWishlist, isInWishlist, removeFromWishlist, getWishlistId } = useWishlist();
    const { isAuthenticated } = useAuth();

    const slug = params.slug as string;
    const productName = params.productName as string;
    const isDropship = params.isDropship === "true";

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showSpecifications, setShowSpecifications] = useState(true);
    const [showShippingInfo, setShowShippingInfo] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addingToWishlist, setAddingToWishlist] = useState(false);
    
    // State to track if product is in wishlist/cart
    const [isInWishlistState, setIsInWishlistState] = useState(false);
    const [isInCartState, setIsInCartState] = useState(false);

    // Helper to get product image URL
    const getProductImageUrl = useCallback((product: Product | null): string | null => {
        if (!product) return null;
        
        // Try to get image from images array
        if (product.images && product.images.length > 0) {
            const primaryImage = product.images.find(img => img.is_primary);
            if (primaryImage?.image) {
                console.log('✅ Using primary image:', primaryImage.image);
                return primaryImage.image;
            }
            
            // Fallback to first image
            if (product.images[0]?.image) {
                console.log('✅ Using first image:', product.images[0].image);
                return product.images[0].image;
            }
        }
        
        // Fallback to main_image if available
        if (product.main_image) {
            console.log('✅ Using main_image:', product.main_image);
            return product.main_image;
        }
        
        console.log('❌ No image found for product');
        return null;
    }, []);

    // Helper function to validate UUID
    const isValidUUID = (uuid: string): boolean => {
        if (!uuid || typeof uuid !== 'string') return false;
        
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid.trim());
    };

    // Smart navigation handler
    const handleGoBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
        } else {
            if (isDropship) {
                router.replace("/(customer)/explore-dropship");
            } else {
                router.replace("/(customer)/explore");
            }
        }
    }, [router, isDropship]);

    // Format rating display
    const formatRating = useCallback((rating: string) => {
        const numRating = parseFloat(rating);
        return isNaN(numRating) ? "0.0" : numRating.toFixed(1);
    }, []);

    // Format price - UPDATED TO EURO
    const formatPrice = (price: string | number | undefined | null) => {
        if (price === undefined || price === null) return "€0.00";
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numPrice)) return "€0.00";
        return `€${numPrice.toFixed(2)}`;
    };

    // Calculate unit price
    const getUnitPrice = useMemo(() => {
        if (selectedVariant) {
            return parseFloat(selectedVariant.final_price);
        }
        return product ? parseFloat(product.price) : 0;
    }, [selectedVariant, product]);

    // Calculate total price based on quantity
    const getTotalPrice = useMemo(() => {
        return getUnitPrice * quantity;
    }, [getUnitPrice, quantity]);

    // Calculate discount percentage
    const calculateDiscount = (price: string, comparePrice: string | null) => {
        if (!comparePrice) return 0;
        const currentPrice = parseFloat(price);
        const originalPrice = parseFloat(comparePrice);
        if (isNaN(currentPrice) || isNaN(originalPrice) || originalPrice <= 0) return 0;
        const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
        return Math.round(discount);
    };

    // Calculate total savings if there's a compare price
    const getTotalSavings = useMemo(() => {
        if (!product?.compare_at_price) return 0;
        const comparePrice = parseFloat(product.compare_at_price);
        return (comparePrice - getUnitPrice) * quantity;
    }, [product, getUnitPrice, quantity]);

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

                console.log("Product data received:", productData);
                console.log("Product images:", productData.images);
                console.log("Vendor info from API:", productData.vendor_info);

                setProduct(productData);

                // Set default variant (first variant or base product)
                if (productData.variants && productData.variants.length > 0) {
                    setSelectedVariant(productData.variants[0]);
                    const options: Record<string, string> = {};
                    if (productData.variants[0].options) {
                        Object.entries(productData.variants[0].options).forEach(([key, value]) => {
                            options[key] = value;
                        });
                    }
                    setSelectedOptions(options);
                }

                // Check if product is in wishlist
                try {
                    const inWishlist = await isInWishlist(productData.id);
                    setIsInWishlistState(inWishlist);
                } catch (checkError) {
                    console.warn('Could not check wishlist status:', checkError);
                }
                
                // Check if product is in cart
                try {
                    const inCart = isInCart(productData.id);
                    setIsInCartState(inCart);
                } catch (cartError) {
                    console.warn('Could not check cart status:', cartError);
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
    }, [slug, t, isInWishlist, isInCart]);

    useEffect(() => {
        if (slug) {
            fetchProductDetails();
        }
    }, [fetchProductDetails, slug]);

    // Handle option selection for variants
    const handleOptionSelect = (optionType: string, optionValue: string) => {
        const newOptions = { ...selectedOptions, [optionType]: optionValue };
        setSelectedOptions(newOptions);

        if (product?.variants) {
            const matchingVariant = product.variants.find(variant => {
                return Object.entries(newOptions).every(([key, value]) => {
                    const variantOption = variant.options?.[key];
                    return variantOption === value;
                });
            });

            if (matchingVariant) {
                setSelectedVariant(matchingVariant);
                // Reset quantity to 1 when variant changes
                setQuantity(1);
            }
        }
    };

    // Handle quantity changes
    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        const maxStock = selectedVariant?.stock_quantity || product?.stock_quantity || 10;
        if (newQuantity >= 1 && newQuantity <= maxStock) {
            setQuantity(newQuantity);
        }
    };

    // Add to cart
    const handleAddToCart = async () => {
        if (!product) return;

        if (!isAuthenticated) {
            Alert.alert(
                t('sign_in_required') || "Sign In Required",
                t('sign_in_to_add_cart') || "Please sign in to add items to your cart",
                [
                    { text: t('cancel') || "Cancel", style: 'cancel' },
                    {
                        text: t('sign_in') || "Sign In",
                        onPress: () => router.push('/(auth)/signIn')
                    }
                ]
            );
            return;
        }

        try {
            setAddingToCart(true);
            
            const productImageUrl = getProductImageUrl(product);
            
            const itemData = {
                productId: product.id,
                storeName: product.vendor_info?.vendor_name || product.brand?.name || 'Stock',
                productName: product.name,
                price: getUnitPrice,
                originalPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : getUnitPrice,
                image: productImageUrl,
                variantId: selectedVariant?.id,
            };

            console.log("Adding to cart:", itemData, "Quantity:", quantity);
            
            const result = await addItem(itemData, quantity) as CartOperationResult;
            
            if (result && result.success) {
                setIsInCartState(true);
                Alert.alert(
                    t('added_to_cart') || "Added to Cart",
                    `${quantity} x ${product.name} has been added to your cart\nTotal: ${formatPrice(getTotalPrice)}`,
                    [
                        { 
                            text: t('view_cart') || "View Cart", 
                            onPress: () => router.push('/cart') 
                        },
                        { text: "OK", style: 'cancel' }
                    ]
                );
            } else {
                Alert.alert(
                    t('error') || "Error",
                    (result as any)?.message || (result as any)?.error || t('failed_to_add_cart') || "Failed to add to cart"
                );
            }
        } catch (error: any) {
            console.error("Error adding to cart:", error);
            Alert.alert(
                t('error') || "Error",
                error?.message || t('failed_to_add_cart') || "Failed to add to cart"
            );
        } finally {
            setAddingToCart(false);
        }
    };

    // Toggle wishlist
    const handleToggleWishlist = async () => {
        if (!product) return;

        if (!isAuthenticated) {
            Alert.alert(
                t('sign_in_required') || "Sign In Required",
                t('sign_in_to_save_wishlist') || "Please sign in to save items to your wishlist",
                [
                    { text: t('cancel') || "Cancel", style: 'cancel' },
                    {
                        text: t('sign_in') || "Sign In",
                        onPress: () => router.push('/(auth)/signIn')
                    }
                ]
            );
            return;
        }

        const productId = product.id;
        const isCurrentlyInWishlist = isInWishlist(productId);

        if (addingToWishlist) {
            return;
        }

        setAddingToWishlist(true);

        try {
            if (isCurrentlyInWishlist) {
                const wishlistId = getWishlistId(productId);
                
                if (!wishlistId) {
                    console.error('[Wishlist] No wishlist ID found for product:', productId);
                    Alert.alert('Error', 'Failed to remove from wishlist');
                    setAddingToWishlist(false);
                    return;
                }
                
                const success = await removeFromWishlist(wishlistId);
                
                if (success) {
                    setIsInWishlistState(false);
                    Alert.alert(
                        t('removed_from_wishlist') || "Removed from Wishlist",
                        `${product.name} has been removed from your wishlist`
                    );
                }
            } else {
                if (!productId) {
                    Alert.alert('Error', 'Product ID is missing.');
                    setAddingToWishlist(false);
                    return;
                }

                const productIdStr = String(productId).trim();

                if (!isValidUUID(productIdStr)) {
                    console.error('❌ Invalid UUID format:', productIdStr);
                    const uuidMatch = productIdStr.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
                    if (uuidMatch) {
                        const extractedUuid = uuidMatch[0];
                        const result = await addToWishlist(extractedUuid);
                        if (result && result.success) {
                            setIsInWishlistState(true);
                        }
                    }
                    setAddingToWishlist(false);
                    return;
                }

                const result = await addToWishlist(productIdStr);
                if (result && result.success) {
                    setIsInWishlistState(true);
                    Alert.alert(
                        'Saved Successfully!',
                        `${product.name} has been added to your wishlist.`,
                        [
                            {
                                text: 'View Wishlist',
                                onPress: () => router.push('/(customer)/wishlist')
                            },
                            {
                                text: 'Continue Shopping',
                                style: 'cancel'
                            }
                        ]
                    );
                }
            }
        } catch (error: any) {
            console.error("Error toggling wishlist:", error);
            Alert.alert(t('error') || "Error", error.message || "Failed to update wishlist");
        } finally {
            setAddingToWishlist(false);
        }
    };

    // Buy now
    const handleBuyNow = async () => {
        if (!product) return;

        if (!isAuthenticated) {
            Alert.alert(
                t('sign_in_required') || "Sign In Required",
                t('sign_in_to_buy') || "Please sign in to purchase items",
                [
                    { text: t('cancel') || "Cancel", style: 'cancel' },
                    {
                        text: t('sign_in') || "Sign In",
                        onPress: () => router.push('/(auth)/signIn')
                    }
                ]
            );
            return;
        }

        try {
            setAddingToCart(true);
            
            const productImageUrl = getProductImageUrl(product);
            
            const itemData = {
                productId: product.id,
                storeName: product.vendor_info?.vendor_name || product.brand?.name || 'Stock',
                productName: product.name,
                price: getUnitPrice,
                originalPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : getUnitPrice,
                image: productImageUrl,
                variantId: selectedVariant?.id,
            };

            const result = await addItem(itemData, quantity) as CartOperationResult;
            
            if (result && result.success) {
                setIsInCartState(true);
                setTimeout(() => {
                    router.push('/cart');
                }, 500);
            } else {
                Alert.alert(
                    t('error') || "Error",
                    (result as any)?.message || (result as any)?.error || t('failed_to_add_cart') || "Failed to add to cart"
                );
            }
        } catch (error: any) {
            console.error("Error in buy now:", error);
            Alert.alert(
                t('error') || "Error",
                error?.message || t('failed_to_add_cart') || "Failed to add to cart"
            );
        } finally {
            setAddingToCart(false);
        }
    };

    const handleNavigateToCategory = () => {
        if (!product?.category?.slug) return;
        router.push({
            pathname: "/(customer)/category",
            params: { slug: product.category.slug }
        });
    };

    const handleNavigateToCart = () => {
        router.push('/cart');
    };

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
                    <TouchableOpacity onPress={handleGoBack}>
                        <Feather name="arrow-left" size={24} color={colors.darkRed} />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold ml-4">
                        {productName || t('product_details') || "Product Details"}
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-lg font-semibold text-gray-800 mb-2">
                        {t('product_not_found') || "Product not found"}
                    </Text>
                    <Text className="text-red-500 text-base mb-6 text-center">
                        {typeof error === 'string' ? error : 'An error occurred'}
                    </Text>

                    <View className="flex-row space-x-4 gap-3">
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
                            onPress={handleGoBack}
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
    const maxQuantity = selectedVariant?.stock_quantity || product.stock_quantity || 10;
    const rating = formatRating(product.rating_average || "0");
    const ratingCount = product.rating_count || 0;

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

    const safeBlueColor = 'blue' in colors ? colors.blue : "#3b82f6";
    const isDropshipProduct = !product.vendor_info || isDropship;
    const productImageUrl = getProductImageUrl(product);

    return (
        <View className="flex-1 bg-white pt-6">
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                {/* Header */}
                <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 py-4">
                    <TouchableOpacity
                        onPress={handleGoBack}
                        className="bg-white/80 p-2 rounded-full"
                    >
                        <Feather name="arrow-left" size={24} color={colors.darkRed} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={handleNavigateToCart}
                        className="bg-white/80 p-2 rounded-full relative"
                    >
                        <Feather name="shopping-cart" size={24} color={colors.darkRed} />
                        {getItemCount() > 0 && (
                            <View className="absolute -top-1 -right-1 bg-darkRed rounded-full w-5 h-5 items-center justify-center">
                                <Text className="text-white text-xs font-bold">
                                    {getItemCount() > 99 ? '99+' : getItemCount()}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Product Image */}
                <View className="relative">
                    <View className="w-full h-80 bg-gray-100 overflow-hidden">
                        <ProductImage uri={productImageUrl} />
                    </View>

                    <TouchableOpacity
                        className="absolute top-4 right-4 bg-white/90 p-3 rounded-full shadow"
                        onPress={handleToggleWishlist}
                        disabled={addingToWishlist}
                    >
                        {addingToWishlist ? (
                            <ActivityIndicator size={22} color={colors.darkRed} />
                        ) : (
                            <MaterialIcons
                                name={isInWishlistState ? "favorite" : "favorite-border"}
                                size={22}
                                color={isInWishlistState ? colors.darkRed : "#666"}
                            />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Product Info */}
                <View className="px-4 pt-6">
                    {product.category && (
                        <TouchableOpacity className="mb-2" onPress={handleNavigateToCategory}>
                            <Text className="text-sm text-gray-500">
                                {product.category.full_path || product.category.name}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <Text className="text-2xl font-bold text-gray-800 mb-2">
                        {product.name}
                    </Text>

                    <View className="flex-row items-center mb-3">
                        <View className="flex-row items-center mr-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <AntDesign
                                    key={star}
                                    name="star"
                                    size={18}
                                    color={star <= Math.floor(parseFloat(rating)) ? "#FFD700" : "#E5E7EB"}
                                />
                            ))}
                        </View>
                        <Text className="text-gray-600 font-semibold mr-2">{rating}</Text>
                        <Text className="text-gray-500">
                            ({ratingCount} {t('reviews') || 'reviews'})
                        </Text>
                        <View className="h-4 w-px bg-gray-300 mx-3" />
                        <Text className="text-gray-500">
                            {product.view_count.toLocaleString()} {t('views') || 'views'}
                        </Text>
                    </View>

                    {/* Price Section - Shows Unit Price and Total Price */}
                    <View className="mb-4">
                        <View className="flex-row items-center">
                            <Text className="text-3xl font-bold text-darkRed mr-3">
                                {formatPrice(getUnitPrice)}
                            </Text>
                            {hasDiscount && product.compare_at_price && (
                                <Text className="text-lg text-gray-400 line-through">
                                    {formatPrice(product.compare_at_price)}
                                </Text>
                            )}
                        </View>
                        {hasDiscount && (
                            <Text className="text-sm text-green-600 font-medium mt-1">
                                Save {formatPrice(parseFloat(product.compare_at_price || "0") - getUnitPrice)} per item
                            </Text>
                        )}
                        
                        {/* Total Price for Quantity */}
                        {quantity > 1 && (
                            <View className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <Text className="text-sm text-gray-600">
                                    Total for {quantity} {quantity === 1 ? 'item' : 'items'}:
                                </Text>
                                <View className="flex-row items-center justify-between mt-1">
                                    <Text className="text-2xl font-bold text-darkRed">
                                        {formatPrice(getTotalPrice)}
                                    </Text>
                                    {hasDiscount && getTotalSavings > 0 && (
                                        <Text className="text-sm text-green-600 font-medium">
                                            Save {formatPrice(getTotalSavings)} total
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>

                    <View className={`flex-row items-center p-3 rounded-lg mb-4 ${isInStock ? 'bg-green-50' : 'bg-red-50'}`}>
                        <View className={`w-3 h-3 rounded-full mr-2 ${isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className={isInStock ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                            {isInStock
                                ? `${t('in_stock') || 'In stock'} - ${maxQuantity} ${t('available') || 'available'}`
                                : t('out_of_stock') || 'Out of stock'
                            }
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm text-gray-500 mb-1">
                            {t('sku') || 'SKU'}: {product.sku}
                        </Text>
                        {product.brand && (
                            <Text className="text-sm text-gray-500 mb-1">
                                {t('brand') || 'Brand'}: {product.brand.name}
                            </Text>
                        )}
                        {!isDropshipProduct && product.vendor_info && (
                            <Text className="text-sm text-darkRed font-medium mt-2">
                                Sold by: {product.vendor_info.vendor_name}
                            </Text>
                        )}
                    </View>

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
                        
                        {/* Quick quantity selectors for bulk purchase */}
                        {maxQuantity >= 5 && (
                            <View className="flex-row mt-3 gap-2">
                                {[2, 3, 5, 10].filter(num => num <= maxQuantity).map(num => (
                                    <TouchableOpacity
                                        key={num}
                                        className={`px-3 py-1.5 rounded-lg border ${quantity === num ? 'bg-darkRed border-darkRed' : 'border-gray-300'}`}
                                        onPress={() => setQuantity(num)}
                                    >
                                        <Text className={quantity === num ? 'text-white' : 'text-gray-700'}>
                                            {num}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View className="flex-row space-x-3 mb-8 gap-2">
                        <TouchableOpacity
                            className={`flex-1 py-4 rounded-xl items-center justify-center ${isInStock ? 'bg-darkRed' : 'bg-gray-300'}`}
                            onPress={handleAddToCart}
                            disabled={!isInStock || addingToCart || isInCartState}
                        >
                            {addingToCart ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white text-lg font-semibold">
                                    {isInCartState ? 'In Cart' : t('add_to_cart') || 'Add to Cart'}
                                </Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-4 rounded-xl items-center justify-center border ${isInStock ? 'border-darkRed' : 'border-gray-300'}`}
                            onPress={handleBuyNow}
                            disabled={!isInStock || addingToCart}
                        >
                            <Text className={`text-lg font-semibold ${isInStock ? 'text-darkRed' : 'text-gray-500'}`}>
                                {t('buy_now') || 'Buy Now'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row flex-wrap justify-between mb-8">
                        <View className="items-center w-1/3 mb-4">
                            <MaterialIcons name="verified-user" size={24} color={colors.darkRed} />
                            <Text className="text-sm font-medium mt-1 text-center">
                                {t('authentic') || '100% Authentic'}
                            </Text>
                        </View>
                        <View className="items-center w-1/3 mb-4">
                            <Feather name="truck" size={24} color={colors.darkRed} />
                            <Text className="text-sm font-medium mt-1 text-center">
                                {t('free_shipping') || 'Free Shipping'}
                            </Text>
                        </View>
                        <View className="items-center w-1/3 mb-4">
                            <Feather name="refresh-ccw" size={24} color={colors.darkRed} />
                            <Text className="text-sm font-medium mt-1 text-center">
                                {t('easy_returns') || 'Easy Returns'}
                            </Text>
                        </View>
                    </View>

                    <View className="mb-6">
                        <TouchableOpacity
                            className="flex-row justify-between items-center mb-3"
                            onPress={() => setShowFullDescription(!showFullDescription)}
                        >
                            <Text className="text-lg font-bold text-gray-800">
                                {t('description') || 'Description'}
                            </Text>
                            <AntDesign name={showFullDescription ? "up" : "down"} size={20} color="#666" />
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

                    {product.attributes && product.attributes.length > 0 && (
                        <View className="mb-6">
                            <TouchableOpacity
                                className="flex-row justify-between items-center mb-3"
                                onPress={() => setShowSpecifications(!showSpecifications)}
                            >
                                <Text className="text-lg font-bold text-gray-800">
                                    {t('specifications') || 'Specifications'}
                                </Text>
                                <AntDesign name={showSpecifications ? "up" : "down"} size={20} color="#666" />
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

                    <View className="mb-6">
                        <TouchableOpacity
                            className="flex-row justify-between items-center mb-3"
                            onPress={() => setShowShippingInfo(!showShippingInfo)}
                        >
                            <Text className="text-lg font-bold text-gray-800">
                                {t('shipping_info') || 'Shipping Information'}
                            </Text>
                            <AntDesign name={showShippingInfo ? "up" : "down"} size={20} color="#666" />
                        </TouchableOpacity>

                        {showShippingInfo && (
                            <View className="bg-gray-50 rounded-xl p-4">
                                <View className="flex-row items-center mb-3">
                                    <Feather name="truck" size={20} color={colors.darkRed} />
                                    <Text className="font-medium ml-2">
                                        {t('estimated_delivery') || 'Estimated Delivery'}
                                    </Text>
                                </View>
                                <Text className="text-gray-600 mb-2">
                                    • {t('delivery_time_3_7') || '3-7 business days'}
                                </Text>
                                <Text className="text-gray-600 mb-2">
                                    • {t('free_shipping_over') || 'Free shipping on orders over €500'}
                                </Text>
                                <Text className="text-gray-600">
                                    • {t('tracking_available') || 'Tracking number provided'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {product.tags && product.tags.length > 0 && (
                        <View className="mb-8">
                            <Text className="text-lg font-bold text-gray-800 mb-3">
                                {t('tags') || 'Tags'}
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {product.tags.map((tag, index) => (
                                    <TouchableOpacity
                                        key={`${tag}-${index}`}
                                        className="bg-gray-100 px-3 py-1.5 rounded-full"
                                    >
                                        <Text className="text-gray-700 text-sm">{tag}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View className="bg-blue-50 p-4 rounded-xl mb-8">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons name="verified-user" size={20} color={safeBlueColor} />
                            <Text className="font-semibold text-blue-800 ml-2">
                                {t('safe_shopping') || 'Safe Shopping Guarantee'}
                            </Text>
                        </View>
                        <Text className="text-blue-700 text-sm">
                            {t('safe_shopping_description') || 'Your payment information is encrypted and secure.'}
                        </Text>
                    </View>
                </View>

                <View className="h-24" />
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <View className="flex-row space-x-3 gap-2">
                    <TouchableOpacity
                        className="w-12 h-12 bg-gray-100 items-center justify-center rounded-xl"
                        onPress={handleToggleWishlist}
                        disabled={addingToWishlist}
                    >
                        {addingToWishlist ? (
                            <ActivityIndicator size={24} color={colors.darkRed} />
                        ) : (
                            <MaterialIcons
                                name={isInWishlistState ? "favorite" : "favorite-border"}
                                size={24}
                                color={isInWishlistState ? colors.darkRed : "#666"}
                            />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-darkRed py-3 rounded-xl items-center justify-center"
                        onPress={handleBuyNow}
                        disabled={!isInStock || addingToCart}
                    >
                        {addingToCart ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="text-white text-lg font-semibold">
                                {t('buy_now') || 'Buy Now'} • {formatPrice(getTotalPrice)}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default ProductDetailsPage;