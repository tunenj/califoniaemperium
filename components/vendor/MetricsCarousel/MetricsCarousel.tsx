import { ScrollView, View, Text } from "react-native"; 
import { MetricCard } from "../MetricCard/MetricCard";

export default function MetricsCarousel() {
    return (
        <View className="bg-orange-50 -mt-6 mb-4 py-6">
            {/* Header Text */}
            <View className="items-center justify-center mb-4 px-4">
                <Text className="text-sm text-center">
                    <Text className="font-bold text-base text-black">Dashboard</Text> Welcome back! Here&apos;s what&apos;s happening today.
                </Text>
            </View>

            {/* Cards */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
            >
                <MetricCard 
                    label="Total Revenue" 
                    value="2,000,000" 
                    valuePrefix="₦"
                    trend={{ 
                        value: "+12.5%", 
                        positive: true,
                        label: "vs Last Month"
                    }} 
                    icon="wallet"
                    sideColor="#EC6625"
                />
                <MetricCard 
                    label="Total Orders" 
                    value="20" 
                    trend={{ 
                        value: "+70.5%", 
                        positive: true,
                        label: "vs Last Month"
                    }} 
                    icon="cart"
                    sideColor="#FFA500"
                />
                <MetricCard 
                    label="Active Vendor" 
                    value="10" 
                    subValue="1 pending approval" 
                    icon="people"
                    sideColor="#B8860B"
                />
                <MetricCard 
                    label="Products Listed" 
                    value="7" 
                    subValue="1 pending review" 
                    icon="cube"
                    sideColor="#90EE90"
                />
            </ScrollView>

        </View>
    );
}
