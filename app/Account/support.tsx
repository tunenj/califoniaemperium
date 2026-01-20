import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Linking, 
    Image,
    Alert
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from 'expo-clipboard';
import { useRouter } from "expo-router";

// Type definitions
export type SectionItem = {
    text: string;
    icon?: string;
    onPress?: () => void;
};

export type Section = {
    title: string;
    items: SectionItem[];
};

export type SocialMediaPlatform =
    | 'Instagram'
    | 'Facebook'
    | 'X (formerly Twitter)'
    | 'TikTok';

export type SocialMediaUrls = Record<SocialMediaPlatform, string>;

const SupportScreen = () => {
    const sections: Section[] = [
        {
            title: 'About',
            items: [
                { text: 'Report an issue', icon: 'bug-outline', onPress: () => console.log('Report issue pressed') },
                { text: 'Rate us', icon: 'star-outline', onPress: () => console.log('Rate us pressed') },
                { text: 'Contact Us', icon: 'mail-outline', onPress: () => console.log('Contact us pressed') }
            ]
        },
        {
            title: 'Contact Information',
            items: [
                { text: 'support@coffordhelp.com', icon: 'mail-outline', onPress: () => Linking.openURL('mailto:support@coffordhelp.com') },
                { text: '+224 818 8130', icon: 'call-outline', onPress: () => Linking.openURL('tel:+2248188130') },
                { text: '+224 818 8130', icon: 'call-outline', onPress: () => Linking.openURL('tel:+2248188130') }
            ]
        },
        {
            title: 'Social Media',
            items: [
                { text: 'Instagram', icon: 'logo-instagram' },
                { text: 'Facebook', icon: 'logo-facebook' },
                { text: 'X (formerly Twitter)', icon: 'logo-twitter' },
                { text: 'TikTok', icon: 'logo-tiktok' }
            ]
        },
        {
            title: 'FAQs',
            items: [
                { text: 'How do I initiate a transaction?', onPress: () => console.log('FAQ 1 pressed') },
                { text: 'How do I ensure or validate the authenticity of a vendor?', onPress: () => console.log('FAQ 2 pressed') },
                { text: 'What are the charges on each transaction?', onPress: () => console.log('FAQ 3 pressed') }
            ]
        }
    ];

    const socialUrls: SocialMediaUrls = {
        Instagram: 'https://instagram.com/coffords',
        Facebook: 'https://facebook.com/coffords',
        'X (formerly Twitter)': 'https://twitter.com/coffords',
        TikTok: 'https://tiktok.com/@coffords'
    };

    const handleSocialMediaPress = (platform: SocialMediaPlatform) => {
        const url = socialUrls[platform];
        Linking.openURL(url).catch(err =>
            console.error(`Failed to open URL for ${platform}:`, err)
        );
    };

    const handleItemPress = (section: Section, item: SectionItem) => {
        if (section.title === 'Social Media') {
            handleSocialMediaPress(item.text as SocialMediaPlatform);
        } else if (item.onPress) {
            item.onPress();
        }
    };

    const handleCopyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        Alert.alert("Copied", `${text} copied to clipboard`);
    };

    const renderSectionHeader = (title: string) => (
        <Text className="text-base font-semibold text-gray-700 mb-4">
            {title}
        </Text>
    );

    const renderSectionItem = (
        section: Section,
        item: SectionItem,
        index: number,
        isLast: boolean
    ) => (
        <TouchableOpacity
            key={index}
            onPress={() => handleItemPress(section, item)}
            activeOpacity={0.7}
            className={`flex-row items-center py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}
        >
            {/* Show black thick dot for FAQs, otherwise show icon */}
            {section.title === 'FAQs' ? (
                <View className="w-1 h-1 bg-black rounded-full mr-3" />
            ) : (
                <Icon
                    name={item.icon!}
                    size={22}
                    style={{ marginRight: 12 }}
                    color="#000000"
                />
            )}
            <Text className="text-gray-700 flex-1">
                {item.text}
            </Text>


            {/* Show copy icon for Contact Information, chevron for others */}
            {section.title === 'Contact Information' ? (
                <TouchableOpacity onPress={() => handleCopyToClipboard(item.text)}>
                    <Icon name="copy-outline" size={18} color="#9CA3AF" />
                </TouchableOpacity>
            ) : (
                <Icon
                    name="chevron-forward-outline"
                    size={18}
                    color="#9CA3AF"
                />
            )}
        </TouchableOpacity>
    );

    const renderSection = (section: Section, index: number) => (
        <View key={index} className="mb-8">
            {renderSectionHeader(section.title)}
            {section.items.map((item, itemIndex) =>
                renderSectionItem(section, item, itemIndex, itemIndex === section.items.length - 1)
            )}
        </View>
    );

    const router = useRouter();

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            showsVerticalScrollIndicator={false}
        >
            <LinearGradient
                colors={["#B13239", "#4D0812"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 44, width: "100%" }}
            />

            <View className="p-3">

                {/* Header */}
                <View className="h-14 px-4 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Icon name="chevron-back" size={24} color="#000" />
                    </TouchableOpacity>

                    <Text className="text-lg ml-2 font-bold">Security</Text>
                </View>

                <View className="mb-4 p-4 bg-white rounded-lg shadow-sm">
                    <View className="flex-row items-center justify-between mb-2">
                        {/* Left side: icon + text */}
                        <View className="flex-row items-center">
                            <Image
                                source={require("../../assets/images/icon.png")}
                                className="w-4 h-4"
                            />
                            <Text className="text-base text-gray-500 ml-4">
                                About California Emporium
                            </Text>
                        </View>

                        {/* Right side: chevron */}
                        <Icon name="chevron-forward-outline" size={20} color="#9CA3AF" />
                    </View>
                    <View className="h-px bg-gray-200 mb-4" />

                    {sections.map(renderSection)}
                </View>
            </View>
        </ScrollView>
    );
};

export default SupportScreen;
