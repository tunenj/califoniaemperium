import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import AnimatedStep from "@/components/AnimatedStep";
import StepIndicator from "@/components/StepIndicator";
import { useSetup } from "@/context/SetupContext";

export default function Step3() {
    const router = useRouter();
    const { data, update } = useSetup();

    const [idFile, setIdFile] =
        useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [photoFile, setPhotoFile] =
        useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const pickFile = async (type: "id" | "photo") => {
        const res = await DocumentPicker.getDocumentAsync({
            type: "*/*",
        });

        if (!res.canceled) {
            const file = res.assets[0];
            if (type === "id") {
                setIdFile(file);
                update({ idDocument: file });
            } else {
                setPhotoFile(file);
                update({ businessPhoto: file });
            }
        }
    };

    const isValid =
        Boolean(data.shopAddress) &&
        Boolean(data.businessRegNumber) &&
        Boolean(idFile) &&
        Boolean(photoFile);

    return (
        <AnimatedStep>
            <SafeAreaView className="flex-1 bg-white">
                {/* Fixed Header + Indicator */}
                <View className="px-5 pt-4">
                    {/* Header */}
                    <View className="items-center mb-4 relative">
                        <Image
                            source={require("@/assets/images/icon.png")}
                            className="w-20 h-20 mb-3"
                            resizeMode="contain"
                        />

                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="absolute left-0 top-2"
                        >
                            <Ionicons name="arrow-back" size={22} />
                        </TouchableOpacity>

                        <Text className="font-semibold text-base mt-2">
                            Welcome, {data.firstName || "User"}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">
                            Set up your business profile
                        </Text>
                    </View>

                    {/* Step Indicator */}
                    <StepIndicator totalSteps={3} currentStep={3} />
                </View>

                {/* Scrollable Content */}
                <ScrollView
                    className="flex-1 px-5"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 30 }}
                >
                    <Text className="font-medium text-black mb-4 text-right">
                        Documentation
                    </Text>

                    {/* Shop Address */}
                     <Text className="text-xs text-gray-400 mb-1">
                        Business Adress
                    </Text>
                    <TextInput
                        placeholder="Business address"
                        value={data.shopAddress ?? ""}
                        onChangeText={(v) => update({ shopAddress: v })}
                        className="border-b py-2 mb-5"
                    />

                    {/* Business Reg Number */}
                    <Text className="text-xs text-gray-400 mb-1">
                        Business registration number
                    </Text>
                    <TextInput
                        placeholder="Enter number"
                        value={data.businessRegNumber ?? ""}
                        onChangeText={(v) =>
                            update({ businessRegNumber: v })
                        }
                        className="border-b py-2 mb-5"
                    />

                    {/* Social Links */}
                    <Text className="text-xs text-gray-400 mb-1">
                        Social link
                    </Text>
                    <TextInput
                        placeholder="Link 1"
                        value={data.socialLink1 ?? ""}
                        onChangeText={(v) =>
                            update({ socialLink1: v })
                        }
                        className="border-b py-2 mb-4"
                    />

                    <TextInput
                        placeholder="Link 2 (optional)"
                        value={data.socialLink2 ?? ""}
                        onChangeText={(v) =>
                            update({ socialLink2: v })
                        }
                        className="border-b py-2 mb-4"
                    />

                    <TextInput
                        placeholder="Link 3 (optional)"
                        value={data.socialLink3 ?? ""}
                        onChangeText={(v) =>
                            update({ socialLink3: v })
                        }
                        className="border-b py-2 mb-6"
                    />

                    {/* ID Upload */}
                    <Text className="text-xs text-gray-400 mb-2">
                        Means of identification
                    </Text>
                    <TouchableOpacity
                        onPress={() => pickFile("id")}
                        className="border border-dashed border-red-300 bg-red-50 py-4 rounded-lg items-center mb-4"
                    >
                        <Ionicons
                            name="cloud-upload-outline"
                            size={22}
                            color="#00000"
                        />
                        <Text className="text-xs mt-1">Browse files</Text>
                        <Text className="text-[10px] text-gray-400">
                            Max size 10mb
                        </Text>
                        {idFile && (
                            <Text className="text-[10px] mt-1">
                                {idFile.name}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Photo Upload */}
                    <Text className="text-xs text-gray-400 mb-2">
                        Upload photo
                    </Text>
                    <TouchableOpacity
                        onPress={() => pickFile("photo")}
                        className="border border-dashed border-red-300 bg-red-50 py-4 rounded-lg items-center mb-8"
                    >
                        <Ionicons
                            name="cloud-upload-outline"
                            size={22}
                            color="#00000"
                        />
                        <Text className="text-xs mt-1">Browse files</Text>
                        <Text className="text-[10px] text-gray-400">
                            Max size 10mb
                        </Text>
                        {photoFile && (
                            <Text className="text-[10px] mt-1">
                                {photoFile.name}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Submit */}
                    <TouchableOpacity
                        disabled={!isValid}
                        onPress={() => {
                            // Optional: submit data to backend here
                            router.replace("/Setup/business-setup/success");
                        }}

                        className={`py-4 rounded-lg items-center ${isValid ? "bg-red-600" : "bg-gray-300"
                            }`}
                    >
                        <Text className="text-white font-medium">
                            Next
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </AnimatedStep>
    );
}
