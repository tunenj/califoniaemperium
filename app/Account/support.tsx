import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';

/* ================= TYPES ================= */

export type SocialMediaPlatform =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube';

export type SectionItem = {
  text: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  platform?: SocialMediaPlatform;
};

export type Section = {
  title: string;
  items: SectionItem[];
};

export type SocialMediaUrls = Record<SocialMediaPlatform, string>;

/* ================= SCREEN ================= */

const SupportScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const socialUrls: SocialMediaUrls = {
    instagram: 'https://www.instagram.com/califonia.emporium?utm_source=qr&igsh=d3VlYXd3cjV6ZnZh',
    facebook: 'https://www.facebook.com/share/1DD5ogWR4e/',
    tiktok: 'https://www.tiktok.com/@califonia.emporiu?_r=1&_t=ZN-93kpvqhQzfK',
    youtube: 'https://youtube.com/@califoniaemporiumlimited?si=glRlkzefyBBUeMGd', 
  };

  const sections: Section[] = [
    {
      title: t('about'),
      items: [
        { 
          text: t('report_issue'), 
          icon: 'bug-outline',
          onPress: () => router.push('/(customer)/messages')
        },
        { 
          text: t('rate_us'), 
          icon: 'star-outline' 
        },
      ],
    },
    {
      title: t('social_media'),
      items: [
        {
          text: t('instagram'),
          icon: 'logo-instagram',
          platform: 'instagram',
        },
        {
          text: t('facebook'),
          icon: 'logo-facebook',
          platform: 'facebook',
        },
        {
          text: t('tiktok'),
          icon: 'logo-tiktok',
          platform: 'tiktok',
        },
        {
          text: t('youtube'),
          icon: 'logo-youtube',
          platform: 'youtube',
        },
      ],
    },
  ];

  const handleItemPress = (section: Section, item: SectionItem) => {
    if (item.platform) {
      const url = socialUrls[item.platform];
      Linking.openURL(url);
      return;
    }

    if (item.onPress) {
      item.onPress();
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <LinearGradient
        colors={['#B13239', '#4D0812']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 44 }}
      />

      <View className="p-3">
        {/* Header */}
        <View className="h-14 flex-row items-center px-4">
          <TouchableOpacity onPress={router.back}>
            <Ionicons name="chevron-back" size={24} />
          </TouchableOpacity>
          <Text className="ml-2 text-lg font-bold">{t('support')}</Text>
        </View>

        <View className="bg-white rounded-lg p-4">
          <View className="flex-row items-center mb-4">
            <Image
              source={require('../../assets/images/icon.png')}
              className="w-4 h-4"
            />
            <Text className="ml-4 text-gray-500">
              {t('about_california_emporium')}
            </Text>
          </View>

          {/* Send Message Button */}
          <TouchableOpacity
            onPress={() => router.push('/(customer)/messages')}
            className="bg-darkRed py-4 rounded-xl items-center mb-6"
          >
            <View className="flex-row items-center">
              <Ionicons name="mail-outline" size={20} color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                {t('send_us_a_message') || 'Send us a Message'}
              </Text>
            </View>
          </TouchableOpacity>

          {sections.map((section, index) => (
            <View key={index} className="mb-6">
              <Text className="mb-3 font-semibold text-gray-700">
                {section.title}
              </Text>

              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleItemPress(section, item)}
                  className="flex-row items-center py-3 border-b border-gray-100"
                >
                  <Ionicons
                    name={item.icon!}
                    size={22}
                    color="#000"
                    style={{ marginRight: 12 }}
                  />

                  <Text className="flex-1 text-gray-700">{item.text}</Text>

                  <Ionicons
                    name="chevron-forward-outline"
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default SupportScreen;