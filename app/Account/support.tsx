import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';

/* ================= TYPES ================= */

export type SocialMediaPlatform =
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'tiktok';

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
    instagram: 'https://instagram.com/coffords',
    facebook: 'https://facebook.com/coffords',
    x: 'https://twitter.com/coffords',
    tiktok: 'https://tiktok.com/@coffords',
  };

  const sections: Section[] = [
    {
      title: t('about'),
      items: [
        { text: t('report_issue'), icon: 'bug-outline' },
        { text: t('rate_us'), icon: 'star-outline' },
        { text: t('contact_us'), icon: 'mail-outline' },
      ],
    },
    {
      title: t('contact_information'),
      items: [
        {
          text: 'support@coffordhelp.com',
          icon: 'mail-outline',
          onPress: () => Linking.openURL('mailto:support@coffordhelp.com'),
        },
        {
          text: '+224 818 8130',
          icon: 'call-outline',
          onPress: () => Linking.openURL('tel:+2248188130'),
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
          text: t('x_twitter'),
          icon: 'logo-twitter',
          platform: 'x',
        },
        {
          text: t('tiktok'),
          icon: 'logo-tiktok',
          platform: 'tiktok',
        },
      ],
    },
    {
      title: t('faqs'),
      items: [
        { text: t('faq_initiate_transaction') },
        { text: t('faq_validate_vendor') },
        { text: t('faq_transaction_charges') },
      ],
    },
  ];

  const handleItemPress = (section: Section, item: SectionItem) => {
    if (item.platform) {
      const url = socialUrls[item.platform];
      Linking.openURL(url);
      return;
    }

    item.onPress?.();
  };

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert(t('copied'), t('copied_to_clipboard', { text }));
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
                  {section.title === t('faqs') ? (
                    <View className="w-1 h-1 bg-black rounded-full mr-3" />
                  ) : (
                    <Ionicons
                      name={item.icon!}
                      size={22}
                      color="#000"
                      style={{ marginRight: 12 }}
                    />
                  )}

                  <Text className="flex-1 text-gray-700">{item.text}</Text>

                  {section.title === t('contact_information') ? (
                    <TouchableOpacity onPress={() => handleCopy(item.text)}>
                      <Ionicons
                        name="copy-outline"
                        size={18}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  ) : (
                    <Ionicons
                      name="chevron-forward-outline"
                      size={18}
                      color="#9CA3AF"
                    />
                  )}
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
