import React, { memo, useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from '@/context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

/* ================= TYPES ================= */

// Map API statuses to our internal status type
type VendorStatus = "submitted" | "approved" | "rejected" | "verified";

type Vendor = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  commission: string;
  totalSales: string;
  status: VendorStatus;
  business_name?: string;
  business_type?: string;
  business_email?: string;
  business_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  description?: string;
  products_description?: string;
  expected_monthly_sales?: string;
  identity_document?: string;
  business_certificate?: string;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
  verified_at?: string;
  isApplication?: boolean;
  rating_average?: string;
  rating_count?: number;
  is_active?: boolean;
  is_accepting_orders?: boolean;
};

/* ================= HELPER FUNCTIONS ================= */

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return `${formatDate(dateString)} ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
};

const formatCurrency = (amount: string | number) => {
  if (!amount) return '₦0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₦0';
  return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

/* ================= STATUS BADGE ================= */

const StatusBadge = memo(({ status, isActive }: { status: VendorStatus; isActive?: boolean }) => {
  const { t } = useLanguage();

  const statusConfig = useMemo(() => {
    const configs = {
      verified: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: "checkmark-circle" as const,
        label: t('verified') || 'Verified'
      },
      approved: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: "checkmark-done" as const,
        label: t('approved') || 'Approved'
      },
      submitted: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "time" as const,
        label: t('submitted') || 'Submitted'
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: "close-circle" as const,
        label: t('rejected') || 'Rejected'
      },
    };
    return configs[status] || configs.submitted;
  }, [status, t]);

  // If isActive is true, show red background with white text
  if (isActive) {
    return (
      <View className="px-3 py-1.5 rounded-full bg-red-600 flex-row items-center gap-1.5">
        <Ionicons name="checkmark-circle" size={14} color="#ffffff" />
        <Text className="text-xs font-semibold text-white">
          {t('active') || 'Active'}
        </Text>
      </View>
    );
  }

  return (
    <View className={`px-3 py-1.5 rounded-full ${statusConfig.bg} flex-row items-center gap-1.5`}>
      <Ionicons
        name={statusConfig.icon}
        size={14}
        color={
          statusConfig.text.includes('green') ? '#166534' :
            statusConfig.text.includes('blue') ? '#1e40af' :
              statusConfig.text.includes('yellow') ? '#854d0e' :
                '#991b1b'
        }
      />
      <Text className={`text-xs font-semibold ${statusConfig.text}`}>
        {statusConfig.label}
      </Text>
    </View>
  );
});

StatusBadge.displayName = "StatusBadge";

/* ================= VENDOR ROW ================= */

const VendorRow = memo(function VendorRow({
  item,
  onViewDetails,
  onQuickApprove,
}: {
  item: Vendor;
  onViewDetails: (vendor: Vendor) => void;
  onQuickApprove: (vendor: Vendor) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => onViewDetails(item)}
      className="flex-row border-b border-gray-100 py-3.5 hover:bg-gray-50 active:bg-gray-50"
    >
      {/* Vendor - Increased width */}
      <View className="w-64 px-3 flex-row items-center gap-3">
        <View className="w-11 h-11 rounded-full bg-gradient-to-br from-red-100 to-red-200 items-center justify-center shadow-sm">
          <Text className="text-red-600 font-bold text-lg">
            {(item.name?.charAt(0) || item.business_name?.charAt(0) || 'V').toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>
            {item.name || 'N/A'}
          </Text>
          {item.business_name && (
            <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
              {item.business_name}
            </Text>
          )}
        </View>
      </View>

      {/* Contact - Increased width */}
      <View className="w-56 px-3 justify-center">
        <Text className="text-xs text-gray-700 font-medium" numberOfLines={1}>
          {item.email || 'N/A'}
        </Text>
        <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
          {item.phone || 'N/A'}
        </Text>
      </View>

      {/* Business Type - Increased width */}
      <View className="w-48 px-3 justify-center">
        <Text className="text-sm text-gray-700" numberOfLines={2}>
          {item.business_type?.split(',').filter(Boolean).slice(0, 2).join(', ') || 'N/A'}
        </Text>
      </View>

      {/* Joined/Created */}
      <View className="w-36 px-3 justify-center">
        <Text className="text-sm text-gray-700">
          {formatDate(item.created_at)}
        </Text>
      </View>

      {/* Total Sales */}
      <View className="w-36 px-3 justify-center">
        <Text className="text-sm text-red-600 font-bold">
          {item.totalSales || '₦0'}
        </Text>
      </View>

      {/* Rating - Increased width */}
      <View className="w-32 px-3 justify-center">
        {item.rating_average ? (
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text className="text-sm text-gray-700 font-semibold">
              {parseFloat(item.rating_average).toFixed(1)}
            </Text>
            <Text className="text-xs text-gray-500">
              ({item.rating_count || 0})
            </Text>
          </View>
        ) : (
          <Text className="text-sm text-gray-500">No ratings</Text>
        )}
      </View>

      {/* Status - Updated to show active status with red background */}
      <View className="w-32 px-3 justify-center">
        <StatusBadge status={item.status} isActive={item.is_active} />
      </View>

      {/* Actions */}
      <View className="w-32 px-3 flex-row items-center gap-2">
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onViewDetails(item);
          }}
          className="p-2.5 rounded-lg bg-blue-50 active:bg-blue-100"
        >
          <Ionicons name="eye-outline" size={18} color="#2563eb" />
        </TouchableOpacity>

        {item.status === "submitted" && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onQuickApprove(item);
            }}
            className="p-2.5 rounded-lg bg-green-50 active:bg-green-100"
          >
            <Ionicons name="checkmark-outline" size={18} color="#16a34a" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

VendorRow.displayName = "VendorRow";

/* ================= VENDOR DETAILS MODAL ================= */

const VendorDetailsModal = memo(({
  vendor,
  visible,
  onClose,
  onApprove,
  onReject,
  loading,
}: {
  vendor: Vendor | null;
  visible: boolean;
  onClose: () => void;
  onApprove: (vendor: Vendor) => void;
  onReject?: (vendor: Vendor) => void;
  loading?: boolean;
}) => {
  const { t } = useLanguage();

  if (!vendor) return null;

  const InfoRow = ({ label, value, valueClass = "text-gray-900" }: {
    label: string;
    value: string;
    valueClass?: string
  }) => (
    <View className="flex-row justify-between items-center py-2.5 border-b border-gray-100 last:border-b-0">
      <Text className="text-sm text-gray-600 flex-1 font-medium">{label}:</Text>
      <Text className={`text-sm font-semibold flex-1 text-right ${valueClass}`} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-base font-bold text-gray-900 mb-3 mt-2">
      {title}
    </Text>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center p-4">
        {/* Increased max height and width for better visibility */}
        <View className="bg-white rounded-2xl w-full max-w-3xl h-[95vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {vendor.isApplication ? t('application_details') || 'Application Details' : t('vendor_details') || 'Vendor Details'}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                <Ionicons name={vendor.isApplication ? "document-text" : "storefront"} size={14} color="#6b7280" />
                {' '}ID: {vendor.id}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-xl bg-gray-100 active:bg-gray-200 ml-3"
              disabled={loading}
            >
              <Ionicons name="close" size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          {/* Content - Increased padding and optimized scrolling */}
          <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={true}>
            {/* Status Banner */}
            <View className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl flex-row items-center justify-between shadow-sm">
              <View className="flex-row items-center gap-2">
                <Ionicons name="information-circle" size={20} color="#6b7280" />
                <Text className="text-sm font-semibold text-gray-700">
                  {t('current_status')}
                </Text>
              </View>
              <StatusBadge status={vendor.status} isActive={vendor.is_active} />
            </View>

            {/* User Information */}
            <View className="mb-6">
              <SectionTitle title={t('user_information') || 'User Information'} />
              <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <InfoRow label={t('name') || 'Name'} value={vendor.name || 'N/A'} />
                <InfoRow label={t('email') || 'Email'} value={vendor.email || 'N/A'} valueClass="text-blue-600" />
                <InfoRow label={t('phone') || 'Phone'} value={vendor.phone || 'N/A'} />
              </View>
            </View>

            {/* Business Information */}
            <View className="mb-6">
              <SectionTitle title={t('business_information') || 'Business Information'} />
              <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <InfoRow label={t('business_name') || 'Business Name'} value={vendor.business_name || 'N/A'} />
                <InfoRow label={t('business_type') || 'Business Type'} value={vendor.business_type || 'N/A'} />
                <InfoRow label={t('business_email') || 'Business Email'} value={vendor.business_email || 'N/A'} valueClass="text-blue-600" />
                <InfoRow label={t('business_phone') || 'Business Phone'} value={vendor.business_phone || 'N/A'} />
                <InfoRow label={t('address') || 'Address'} value={vendor.address || 'N/A'} />
                <InfoRow
                  label={t('location') || 'Location'}
                  value={`${vendor.city || 'N/A'}, ${vendor.state || 'N/A'}`}
                />
                <InfoRow label={t('country') || 'Country'} value={vendor.country || 'N/A'} />
              </View>
            </View>

            {/* Description */}
            {vendor.description && (
              <View className="mb-6">
                <SectionTitle title={t('description') || 'Description'} />
                <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
                  <Text className="text-sm text-gray-800 leading-6">
                    {vendor.description}
                  </Text>
                </View>
              </View>
            )}

            {/* Products Description */}
            {vendor.products_description && (
              <View className="mb-6">
                <SectionTitle title={t('products_description') || 'Products Description'} />
                <View className="bg-purple-50 border border-purple-200 rounded-2xl p-4 shadow-sm">
                  <Text className="text-sm text-gray-800 leading-6">
                    {vendor.products_description}
                  </Text>
                </View>
              </View>
            )}

            {/* Sales & Performance */}
            <View className="mb-6">
              <SectionTitle title={t('sales_performance') || 'Sales & Performance'} />
              <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <InfoRow
                  label={t('total_sales') || 'Total Sales'}
                  value={vendor.totalSales || '₦0'}
                  valueClass="text-red-600"
                />
                <InfoRow
                  label={t('expected_monthly_sales') || 'Expected Monthly Sales'}
                  value={vendor.expected_monthly_sales || 'N/A'}
                />
                {vendor.rating_average && (
                  <>
                    <InfoRow
                      label={t('rating') || 'Rating'}
                      value={`${parseFloat(vendor.rating_average).toFixed(2)} ⭐ (${vendor.rating_count || 0} reviews)`}
                      valueClass="text-yellow-600"
                    />
                  </>
                )}
              </View>
            </View>

            {/* Documents */}
            {(vendor.business_certificate || vendor.identity_document) && (
              <View className="mb-6">
                <SectionTitle title={t('documents') || 'Documents'} />
                <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  {vendor.business_certificate && (
                    <View className="mb-3">
                      <Text className="text-sm text-gray-600 mb-2 font-medium">Business Certificate:</Text>
                      <TouchableOpacity
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-row items-center gap-2"
                      >
                        <Ionicons name="document-attach" size={20} color="#2563eb" />
                        <Text className="text-blue-600 text-sm font-medium flex-1" numberOfLines={1}>
                          {vendor.business_certificate.split('/').pop()}
                        </Text>
                        <Ionicons name="eye-outline" size={18} color="#2563eb" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {vendor.identity_document && (
                    <View>
                      <Text className="text-sm text-gray-600 mb-2 font-medium">Identity Document:</Text>
                      <TouchableOpacity
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-row items-center gap-2"
                      >
                        <Ionicons name="card" size={20} color="#2563eb" />
                        <Text className="text-blue-600 text-sm font-medium flex-1" numberOfLines={1}>
                          {vendor.identity_document.split('/').pop()}
                        </Text>
                        <Ionicons name="eye-outline" size={18} color="#2563eb" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Rejection Reason */}
            {vendor.rejection_reason && (
              <View className="mb-6">
                <SectionTitle title={t('rejection_reason') || 'Rejection Reason'} />
                <View className="bg-red-50 border border-red-300 rounded-2xl p-4 shadow-sm">
                  <View className="flex-row items-start gap-2">
                    <Ionicons name="close-circle" size={18} color="#dc2626" />
                    <Text className="text-sm text-gray-800 leading-6 flex-1">
                      {vendor.rejection_reason}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Timeline */}
            <View className="mb-4">
              <SectionTitle title={t('timeline') || 'Timeline'} />
              <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <InfoRow
                  label={t('created') || 'Created'}
                  value={formatDateTime(vendor.created_at)}
                  valueClass="text-gray-600"
                />
                <InfoRow
                  label={t('last_updated') || 'Last Updated'}
                  value={formatDateTime(vendor.updated_at)}
                  valueClass="text-gray-600"
                />
                {vendor.verified_at && (
                  <InfoRow
                    label={t('verified_at') || 'Verified At'}
                    value={formatDateTime(vendor.verified_at)}
                    valueClass="text-green-600"
                  />
                )}
                {vendor.reviewed_at && (
                  <InfoRow
                    label={t('reviewed_at') || 'Reviewed At'}
                    value={formatDateTime(vendor.reviewed_at)}
                    valueClass="text-blue-600"
                  />
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3.5 rounded-xl bg-white border-2 border-gray-300 items-center active:bg-gray-50"
                disabled={loading}
              >
                <Text className="text-gray-700 font-bold text-base">{t('close') || 'Close'}</Text>
              </TouchableOpacity>

              {vendor.status === "submitted" && (
                <>
                  {onReject && (
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        onReject(vendor);
                      }}
                      className="flex-1 py-3.5 rounded-xl bg-red-600 items-center active:bg-red-700 shadow-lg"
                      disabled={loading}
                    >
                      <Text className="text-white font-bold text-base">{t('reject') || 'Reject'}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onApprove(vendor);
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-green-600 items-center active:bg-green-700 shadow-lg"
                    disabled={loading}
                  >
                    <Text className="text-white font-bold text-base">{t('approve') || 'Approve'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
});

VendorDetailsModal.displayName = "VendorDetailsModal";

/* ================= APPROVAL MODAL ================= */

const ApprovalModal = memo(({
  vendor,
  visible,
  onClose,
  onSubmit,
  loading,
}: {
  vendor: Vendor | null;
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { admin_notes: string }) => void;
  loading?: boolean;
}) => {
  const { t } = useLanguage();
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (visible) {
      setAdminNotes("");
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!adminNotes.trim()) {
      Alert.alert(
        t('error') || 'Error',
        t('admin_notes_required') || 'Please provide approval notes'
      );
      return;
    }

    onSubmit({
      admin_notes: adminNotes.trim(),
    });
  };

  if (!vendor) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center p-4">
        <View className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                <Text className="text-2xl font-bold text-gray-900">
                  {t('approve_vendor') || 'Approve Vendor'}
                </Text>
              </View>
              <Text className="text-sm text-gray-600 mt-1">
                {vendor.business_name || vendor.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-2.5 rounded-xl bg-white active:bg-gray-50 ml-3 shadow-sm"
              disabled={loading}
            >
              <Ionicons name="close" size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
              <View className="flex-row items-start gap-3">
                <Ionicons name="information-circle" size={20} color="#2563eb" />
                <Text className="text-sm text-gray-700 leading-6 flex-1">
                  {t('approving_vendor') || `You are approving ${vendor.business_name || vendor.name}. Please add approval notes.`}
                </Text>
              </View>
            </View>

            {/* Admin Notes */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-800 mb-2.5">
                {t('admin_notes') || 'Admin Notes'} <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={adminNotes}
                onChangeText={setAdminNotes}
                placeholder="Enter approval notes and any special instructions..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={5}
                className="border-2 border-gray-300 rounded-xl px-4 py-3.5 text-base bg-white focus:border-blue-500"
                style={{ minHeight: 120, textAlignVertical: 'top' }}
                editable={!loading}
              />
              <View className="flex-row items-center gap-2 mt-2">
                <Ionicons name="eye-outline" size={14} color="#6b7280" />
                <Text className="text-xs text-gray-500">
                  These notes will be saved with the approval
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3.5 rounded-xl bg-white border-2 border-gray-300 items-center active:bg-gray-50"
                disabled={loading}
              >
                <Text className="text-gray-700 font-bold text-base">{t('cancel') || 'Cancel'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                className={`flex-1 py-3.5 rounded-xl items-center shadow-lg ${loading ? 'bg-green-400' : 'bg-green-600 active:bg-green-700'
                  }`}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                    <Text className="text-white font-bold text-base">{t('approve') || 'Approve'}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
});

ApprovalModal.displayName = "ApprovalModal";

/* ================= STATS CARDS ================= */

const StatsCards = memo(({ vendors }: { vendors: Vendor[] }) => {
  const { t } = useLanguage();

  const stats = useMemo(() => ({
    total: vendors.length,
    submitted: vendors.filter(v => v.status === 'submitted').length,
    approved: vendors.filter(v => v.status === 'approved').length,
    verified: vendors.filter(v => v.status === 'verified').length,
    rejected: vendors.filter(v => v.status === 'rejected').length,
  }), [vendors]);

  const StatCard = ({
    label,
    value,
    icon,
    bgColor,
    iconColor,
    textColor
  }: {
    label: string;
    value: number;
    icon: any;
    bgColor: string;
    iconColor: string;
    textColor: string;
  }) => (
    <View className={`${bgColor} rounded-2xl p-4 shadow-sm border border-opacity-20`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className={`text-xs ${textColor} font-bold uppercase tracking-wide`}>{label}</Text>
        <View className="bg-white/50 p-1.5 rounded-lg">
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
      </View>
      <Text className="text-3xl font-black text-gray-900">{value}</Text>
    </View>
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-5"
    >
      <View className="flex-row gap-3">
        <View className="w-56">
          <StatCard
            label={t('total') || 'Total'}
            value={stats.total}
            icon="people"
            bgColor="bg-blue-100"
            iconColor="#1e40af"
            textColor="text-blue-800"
          />
        </View>
        <View className="w-56">
          <StatCard
            label={t('submitted') || 'Submitted'}
            value={stats.submitted}
            icon="time"
            bgColor="bg-yellow-100"
            iconColor="#b45309"
            textColor="text-yellow-800"
          />
        </View>
        <View className="w-56">
          <StatCard
            label={t('approved') || 'Approved'}
            value={stats.approved}
            icon="checkmark-done"
            bgColor="bg-blue-100"
            iconColor="#1e40af"
            textColor="text-blue-800"
          />
        </View>
        <View className="w-56">
          <StatCard
            label={t('verified') || 'Verified'}
            value={stats.verified}
            icon="checkmark-circle"
            bgColor="bg-green-100"
            iconColor="#15803d"
            textColor="text-green-800"
          />
        </View>
      </View>
    </ScrollView>
  );
});

StatsCards.displayName = "StatsCards";

/* ================= MAIN SCREEN ================= */

export default function VendorManagementScreen() {
  const [activeFilter, setActiveFilter] = useState<"All" | VendorStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const { t } = useLanguage();

  /**
   * Fetch both vendor applications and verified vendors
   */
  const fetchVendors = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(t('error'), t('authentication_required') || 'Authentication required');
        setLoading(false);
        return;
      }

      // Fetch both applications and vendors in parallel
      const [applicationsResponse, vendorsResponse] = await Promise.allSettled([
        api.get(endpoints.getVendorApplications, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        api.get(endpoints.listVendors, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const allVendors: Vendor[] = [];

      // Process applications (submitted/approved/rejected)
      if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value.data?.results) {
        const applications = applicationsResponse.value.data.results.map((item: any) => ({
          id: item.id || '',
          user_id: item.user || '',
          name: item.user_email?.split('@')[0] || 'Unknown',
          email: item.user_email || '',
          phone: item.business_phone || '',
          joined: item.created_at || '',
          commission: '0%',
          totalSales: '₦0',
          status: item.status || 'submitted' as VendorStatus,
          business_name: item.business_name || '',
          business_type: item.business_type || '',
          business_email: item.business_email || '',
          business_phone: item.business_phone || '',
          address: item.address || '',
          city: item.city || '',
          state: item.state || '',
          country: item.country || '',
          description: item.description || '',
          products_description: item.products_description || '',
          expected_monthly_sales: item.expected_monthly_sales || '',
          identity_document: item.identity_document || '',
          business_certificate: item.business_certificate || '',
          rejection_reason: item.rejection_reason || '',
          reviewed_by: item.reviewed_by || '',
          reviewed_at: item.reviewed_at || '',
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
          isApplication: true,
        }));
        allVendors.push(...applications);
      }

      // Process verified vendors
      if (vendorsResponse.status === 'fulfilled' && vendorsResponse.value.data?.results) {
        const activeVendors = vendorsResponse.value.data.results.map((item: any) => ({
          id: item.id || '',
          user_id: item.user || '',
          name: item.user_name || '',
          email: item.user_email || '',
          phone: item.business_phone || '',
          joined: item.created_at || '',
          commission: '0%', // You can add commission logic later
          totalSales: formatCurrency(item.total_sales || 0),
          status: 'verified' as VendorStatus,
          business_name: item.business_name || '',
          business_type: item.business_type || '',
          business_email: item.business_email || '',
          business_phone: item.business_phone || '',
          description: item.description || '',
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
          verified_at: item.verified_at || '',
          rating_average: item.rating_average || '0',
          rating_count: item.rating_count || 0,
          is_active: item.is_active || false,
          is_accepting_orders: item.is_accepting_orders || false,
          isApplication: false,
        }));
        allVendors.push(...activeVendors);
      }

      // Sort by status priority and date
      const statusPriority: Record<VendorStatus, number> = {
        submitted: 1,
        approved: 2,
        verified: 3,
        rejected: 4,
      };

      allVendors.sort((a, b) => {
        const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });

      setVendors(allVendors);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      Alert.alert(
        t('error'),
        error.response?.data?.message || t('failed_to_load_vendors') || 'Failed to load vendors'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  /**
   * Fetch detailed application data
   */
  const fetchApplicationDetails = useCallback(async (applicationId: string) => {
    try {
      setLoadingDetails(true);
      const token = await AsyncStorage.getItem('authToken');

      if (!token) return null;

      const response = await api.get(
        endpoints.getVendorApplicationDetails(applicationId),
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (response.data?.data || response.data) {
        const item = response.data.data || response.data;
        return {
          id: item.id || '',
          user_id: item.user || '',
          name: item.user_email?.split('@')[0] || 'Unknown',
          email: item.user_email || '',
          phone: item.business_phone || '',
          joined: item.created_at || '',
          commission: '0%',
          totalSales: '₦0',
          status: item.status || 'submitted' as VendorStatus,
          business_name: item.business_name || '',
          business_type: item.business_type || '',
          business_email: item.business_email || '',
          business_phone: item.business_phone || '',
          address: item.address || '',
          city: item.city || '',
          state: item.state || '',
          country: item.country || '',
          description: item.description || '',
          products_description: item.products_description || '',
          expected_monthly_sales: item.expected_monthly_sales || '',
          identity_document: item.identity_document || '',
          business_certificate: item.business_certificate || '',
          rejection_reason: item.rejection_reason || '',
          reviewed_by: item.reviewed_by || '',
          reviewed_at: item.reviewed_at || '',
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
          isApplication: true,
        };
      }

      return null;
    } catch (error: any) {
      console.error('Error fetching application details:', error);
      return null;
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVendors(false);
  }, [fetchVendors]);

  /**
   * Handle vendor approval
   */
  const handleApproveVendor = useCallback(async (
    vendor: Vendor,
    data: { admin_notes: string }
  ) => {
    try {
      setApproving(true);
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(t('error'), t('authentication_required') || 'Authentication required');
        return false;
      }

      const payload = {
        action: "approve",
        admin_notes: data.admin_notes,
      };

      const response = await api.post(
        endpoints.vendorApproval(vendor.id),
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success || response.status === 200) {
        Alert.alert(
          t('success') || 'Success',
          t('vendor_approved_successfully') || 'Vendor approved successfully',
          [{ text: 'OK' }]
        );
        await fetchVendors(false);
        return true;
      } else {
        throw new Error(response.data?.message || t('approval_failed') || 'Approval failed');
      }
    } catch (error: any) {
      console.error('Error approving vendor:', error);
      Alert.alert(
        t('error'),
        error.response?.data?.message || t('approval_failed') || 'Failed to approve vendor'
      );
      return false;
    } finally {
      setApproving(false);
    }
  }, [t, fetchVendors]);

  // View vendor details
  const handleViewDetails = useCallback(async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDetailsModalVisible(true);

    // If it's an application, fetch full details
    if (vendor.isApplication) {
      const detailedVendor = await fetchApplicationDetails(vendor.id);
      if (detailedVendor) {
        setSelectedVendor(detailedVendor);
      }
    }
  }, [fetchApplicationDetails]);

  // Handle quick approve
  const handleQuickApprove = useCallback(async (vendor: Vendor) => {
    let vendorToApprove = vendor;

    if (vendor.isApplication) {
      const detailedVendor = await fetchApplicationDetails(vendor.id);
      if (detailedVendor) {
        vendorToApprove = detailedVendor;
      }
    }

    setSelectedVendor(vendorToApprove);
    setApprovalModalVisible(true);
  }, [fetchApplicationDetails]);

  // Handle approval submission
  const handleApprovalSubmit = useCallback(async (
    data: { admin_notes: string }
  ) => {
    if (!selectedVendor) return;

    const success = await handleApproveVendor(selectedVendor, data);
    if (success) {
      setApprovalModalVisible(false);
      setSelectedVendor(null);
    }
  }, [selectedVendor, handleApproveVendor]);

  // Initialize data
  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data = activeFilter === "All"
      ? vendors
      : vendors.filter(vendor => vendor.status === activeFilter);

    if (!searchQuery.trim()) return data;

    const q = searchQuery.toLowerCase();
    return data.filter(vendor =>
      (vendor.name?.toLowerCase() || '').includes(q) ||
      (vendor.email?.toLowerCase() || '').includes(q) ||
      (vendor.phone?.toLowerCase() || '').includes(q) ||
      (vendor.business_name?.toLowerCase() || '').includes(q)
    );
  }, [activeFilter, searchQuery, vendors]);

  // Filter translation
  const getFilterTranslation = useCallback((filter: "All" | VendorStatus) => {
    const translations: Record<string, string> = {
      'All': t('all') || 'All',
      'verified': t('verified') || 'Verified',
      'approved': t('approved') || 'Approved',
      'submitted': t('submitted') || 'Submitted',
      'rejected': t('rejected') || 'Rejected',
    };
    return translations[filter] || filter;
  }, [t]);

  const filters: ("All" | VendorStatus)[] = ["All", "submitted", "approved", "verified", "rejected"];

  // Loading state
  if (loading && vendors.length === 0) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#C62828" />
        <Text className="mt-4 text-gray-600 text-base font-medium">
          {t('loading_vendors') || 'Loading vendors...'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-5 pb-3 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-3xl font-black text-gray-900 tracking-tight">
              {t('vendor_management') || 'Vendor Management'}
            </Text>
            <Text className="text-sm text-gray-600 mt-2 font-medium">
              {t('review_and_manage_vendors') || 'Review and manage vendor applications & verified vendors'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRefresh}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 active:from-gray-200 active:to-gray-300 ml-3 shadow-sm"
            disabled={refreshing}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color={refreshing ? "#9ca3af" : "#374151"}
            />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <StatsCards vendors={vendors} />

        {/* Search */}
        <View className="flex-row items-center bg-gray-100 rounded-2xl border-2 border-gray-200 px-4 py-1 mb-4 shadow-sm">
          <Ionicons name="search-outline" size={22} color="#6b7280" />
          <TextInput
            placeholder={t('search_vendors') || 'Search by name, email, phone, or business...'}
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-3 text-base text-gray-900 font-medium"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <Ionicons name="close-circle" size={22} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          <View className="flex-row gap-2.5">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`px-6 py-2.5 rounded-full shadow-sm ${isActive
                      ? "bg-red-600"
                      : "bg-white border-2 border-gray-200"
                    }`}
                >
                  <Text
                    className={`text-sm font-bold ${isActive ? "text-white" : "text-gray-700"
                      }`}
                  >
                    {getFilterTranslation(filter)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* TABLE - Now horizontally scrollable with wider columns */}
      <View className="flex-1 bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          className="flex-1"
        >
          <View className="min-w-full">
            {filteredData.length === 0 ? (
              <View className="py-24 items-center justify-center">
                <View className="bg-gray-100 p-6 rounded-full mb-4">
                  <Ionicons
                    name={searchQuery ? "search-outline" : "business-outline"}
                    size={48}
                    color="#9ca3af"
                  />
                </View>
                <Text className="text-gray-600 font-semibold text-lg mb-2">
                  {searchQuery
                    ? (t('no_vendors_found') || 'No vendors found')
                    : (t('no_vendors_available') || 'No vendors available')}
                </Text>
                <Text className="text-gray-500 text-sm mb-4">
                  {searchQuery
                    ? 'Try adjusting your search criteria'
                    : 'Vendors will appear here once applications are submitted'}
                </Text>
                {searchQuery && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    className="mt-2 px-6 py-3 bg-red-600 rounded-full shadow-lg"
                  >
                    <Text className="text-white font-bold">Clear Search</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={(item) => `${item.isApplication ? 'app' : 'vendor'}-${item.id}`}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#C62828']}
                    tintColor="#C62828"
                  />
                }
                renderItem={({ item }) => (
                  <VendorRow
                    item={item}
                    onViewDetails={handleViewDetails}
                    onQuickApprove={handleQuickApprove}
                  />
                )}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                  <View className="flex-row bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300 py-4 sticky top-0 shadow-sm">
                    <Text className="w-64 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('vendor') || 'Vendor'}
                    </Text>
                    <Text className="w-56 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('contact') || 'Contact'}
                    </Text>
                    <Text className="w-48 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('business_type') || 'Business Type'}
                    </Text>
                    <Text className="w-36 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('joined') || 'Created'}
                    </Text>
                    <Text className="w-36 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('total_sales') || 'Total Sales'}
                    </Text>
                    <Text className="w-32 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('rating') || 'Rating'}
                    </Text>
                    <Text className="w-32 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('status') || 'Status'}
                    </Text>
                    <Text className="w-32 px-3 text-xs font-black text-gray-700 uppercase tracking-wider">
                      {t('actions') || 'Actions'}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </ScrollView>
      </View>

      {/* Modals */}
      <VendorDetailsModal
        vendor={selectedVendor}
        visible={detailsModalVisible}
        loading={loadingDetails}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedVendor(null);
        }}
        onApprove={(vendor) => {
          setDetailsModalVisible(false);
          setSelectedVendor(vendor);
          setApprovalModalVisible(true);
        }}
      />

      <ApprovalModal
        vendor={selectedVendor}
        visible={approvalModalVisible}
        onClose={() => {
          setApprovalModalVisible(false);
          setSelectedVendor(null);
        }}
        onSubmit={handleApprovalSubmit}
        loading={approving}
      />

      {/* Global Loading Overlay */}
      {(approving || loadingDetails) && (
        <View className="absolute inset-0 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-3xl p-8 items-center min-w-[240px] shadow-2xl">
            <ActivityIndicator size="large" color="#C62828" />
            <Text className="mt-5 text-gray-800 font-bold text-lg">
              {approving
                ? (t('approving_vendor') || 'Approving vendor...')
                : (t('loading_details') || 'Loading details...')}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}