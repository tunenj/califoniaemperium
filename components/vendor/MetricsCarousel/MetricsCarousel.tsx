import { ScrollView, View, Text } from "react-native"; 
import { MetricCard } from "../MetricCard/MetricCard";
import { useLanguage } from '@/context/LanguageContext'; // Import hook

export default function MetricsCarousel() {
    const { t } = useLanguage(); // Add hook

    return (
        <View className="bg-orange-50/40 -mt-6 mb-4 py-6">
            {/* Header Text */}
            <View className="items-center justify-center mb-4 px-4">
                <Text className="text-sm text-center">
                    <Text className="font-bold text-base text-black">{t('dashboard')}</Text> {t('welcome_back_message')}
                </Text>
            </View>

            {/* Cards */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
            >
                <MetricCard 
                    label={t('total_revenue')} 
                    value="2,000,000" 
                    valuePrefix="₦"
                    trend={{ 
                        value: "+12.5%", 
                        positive: true,
                        label: t('vs_last_month')
                    }} 
                    icon="wallet"
                    sideColor="#EC6625"
                />
                <MetricCard 
                    label={t('total_orders')} 
                    value="20" 
                    trend={{ 
                        value: "+70.5%", 
                        positive: true,
                        label: t('vs_last_month')
                    }} 
                    icon="cart"
                    sideColor="#FFA500"
                />
                <MetricCard 
                    label={t('active_vendor')} 
                    value="10" 
                    subValue={t('x_pending_approval', { count: 1 })} 
                    icon="people"
                    sideColor="#B8860B"
                />
                <MetricCard 
                    label={t('products_listed')} 
                    value="7" 
                    subValue={t('x_pending_review', { count: 1 })} 
                    icon="cube"
                    sideColor="#90EE90"
                />
            </ScrollView>
        </View>
    );
}