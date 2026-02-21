import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  type: 'vendor' | 'customer'; // Different terms for different user types
}

const TermsModal: React.FC<TermsModalProps> = ({
  visible,
  onClose,
  onAccept,
  type
}) => {
  const vendorAgreement = `CALIFONIA EMPORIUM VENDOR AGREEMENT & POLICY STATEMENT
Effective Date: 02/15/26
Platform: Califonia Emporium Web App & Mobile Application
Operated By: Califonia Emporium LIMITED ("Platform Owner")

1. INTRODUCTION
This Vendor Agreement and Policy Statement ("Agreement") governs the relationship between Califonia Emporium ("Platform", "We", "Us", "Our") and all registered vendors, sellers, merchants, suppliers, and dropshipping partners ("Vendor", "You", "Your") who onboard, list, and sell products through the Califonia Emporium Web App and Mobile Application.

By registering as a Vendor, you acknowledge that you have read, understood, and agreed to be legally bound by this Agreement, including all policies referenced herein.

2. ELIGIBILITY & REGISTRATION REQUIREMENTS
To qualify as a Vendor, you must:
• Be at least 18 years old.
• Provide accurate business and personal identification details.
• Submit valid government‑issued ID where required.
• Provide verifiable contact information.
• Maintain an active bank account or payout method supported by the Platform.
• Comply with all applicable local and international trade laws.

We reserve the right to approve, reject, or suspend any Vendor account at our sole discretion.

3. ACCOUNT RESPONSIBILITY
Vendors are fully responsible for:
• All activities conducted through their account.
• Maintaining login credential confidentiality.
• Ensuring staff or representatives comply with this Agreement.
• Immediately notifying the Platform of unauthorized access.

The Platform shall not be liable for losses resulting from compromised Vendor credentials.

4. PRODUCT LISTING POLICY
4.1 Permitted Listings
Vendors may list:
• Physical products
• Dropshipping products
• Custom or handmade goods
• Private label products

4.2 Prohibited Products
The following are strictly forbidden:
• Illegal or regulated drugs
• Weapons, firearms, ammunition
• Explosives or hazardous materials
• Counterfeit or pirated goods
• Human body parts
• Adult or pornographic materials
• Stolen goods
• Products violating intellectual property rights
• Any item prohibited by local or international law

Violations will result in immediate suspension or termination.

5. PRODUCT CONTENT & ACCURACY
Vendors must ensure:
• Accurate product titles and descriptions
• Clear product images
• Correct pricing
• Accurate specifications
• Honest advertising
• No misleading claims

The Platform reserves the right to edit, hide, or remove misleading listings.

6. INVENTORY & ORDER FULFILLMENT
Vendors are responsible for:
• Maintaining accurate stock levels
• Processing orders promptly
• Shipping within stated timelines
• Providing valid tracking information
• Ensuring proper packaging

Failure to fulfill orders may result in penalties, refunds, or suspension.

7. DROPSHIPPING POLICY
For Vendors using CJ Dropshipping, AliExpress, Made‑in‑China, or similar suppliers:
• You must ensure supplier reliability.
• You remain responsible for delivery timelines.
• Blind dropshipping is encouraged (no third‑party branding).
• You must handle disputes regardless of supplier fault.

The Platform is not liable for supplier failures.

8. PRICING & COMMISSIONS
• Vendors set their own product prices unless otherwise agreed.
• The Platform will charge a commission per sale.
• Commission rates may vary by category or promotion.
• Payment processing fees may apply.

All fees will be communicated via Vendor Dashboard or official notice.

9. PAYOUT POLICY
Payouts to Vendors shall be made:
• On a scheduled cycle (e.g., weekly/bi‑weekly).
• After order delivery confirmation.
• After expiration of return/refund window.

The Platform reserves the right to withhold payouts for:
• Fraud investigations
• Chargebacks
• Customer disputes
• Policy violations

10. RETURNS, REFUNDS & DISPUTES
Vendors must:
• Accept returns where applicable.
• Honor refund policies stated on listings.
• Resolve disputes within stipulated timelines.

If Vendors fail to act, the Platform may:
• Issue refunds on Vendor's behalf.
• Deduct costs from Vendor balance.

11. SERVICE LEVEL EXPECTATIONS
Vendors are expected to maintain:
• High fulfillment rates
• Low cancellation rates
• Timely shipping
• Responsive communication
• Positive customer ratings

Repeated poor performance may result in account review or suspension.

12. INTELLECTUAL PROPERTY
By listing on Califonia Emporium, Vendors:
• Grant the Platform rights to use product images, logos, and descriptions for marketing.
• Confirm they own or have rights to listed content.

Copyright violations will lead to removal and possible legal action.

13. PLATFORM RIGHTS
Califonia Emporium reserves the right to:
• Remove listings
• Adjust visibility/rankings
• Suspend accounts
• Withhold payouts during investigations
• Modify platform features

14. DATA & PRIVACY
Vendor data will be handled in accordance with our Privacy Policy.

Vendors must:
• Protect customer data
• Not misuse buyer information
• Comply with data protection laws (GDPR where applicable)

15. FEES & SUBSCRIPTIONS
Where applicable, Vendors may be charged for:
• Premium storefronts
• Advertising placements
• Promotional campaigns
• Subscription tools

All optional fees will require Vendor consent.

16. TAX RESPONSIBILITY
Vendors are solely responsible for:
• Sales tax
• VAT
• Customs duties
• Import/export compliance
• Income tax reporting

The Platform is not liable for Vendor tax obligations.

17. TERMINATION
Vendor accounts may be terminated for:
• Policy violations
• Fraudulent activity
• Customer deception
• Illegal product listings
• Repeated fulfillment failures

Vendors may also request voluntary account closure.

18. LIMITATION OF LIABILITY
Califonia Emporium shall not be liable for:
• Supplier failures
• Logistics delays
• Loss of profits
• Indirect damages
• Third‑party service outages

Platform liability is limited to fees paid within the last 3 months.

19. INDEMNIFICATION
Vendors agree to indemnify and hold harmless Califonia Emporium limited from:
• Legal claims
• Product liability issues
• Intellectual property disputes
• Regulatory violations

20. POLICY UPDATES
We reserve the right to modify this Agreement at any time.

Vendors will be notified via:
• Email
• Dashboard notice
• Platform announcement

Continued use constitutes acceptance.

21. GOVERNING LAW
This Agreement shall be governed by and interpreted under the laws of international e‑commerce regulations.

22. ACCEPTANCE STATEMENT
By clicking "I Agree" during onboarding, you confirm that:
• You have read this Agreement.
• You understand your obligations.
• You consent to all Vendor policies.
• You accept legal responsibility for your activities on the Platform.

For inquiries:
Email: support@califoniaemporium.com
Company: Califonia Emporium limited 
Platform: Califonia Emporium

*End of Vendor Agreement & Policy Statement
Agreement Version: 1.0
Effective Date: 02/15/26

Agreement Versioning & Policy Updates
Califonia Emporium reserves the right to amend, update, or modify this Vendor Agreement and Policy Statement at any time to reflect platform improvements, regulatory changes, or operational requirements.

When updates occur:
• A new Agreement Version will be released.
• Vendors will be notified via email and/or in‑app notification.
• Continued use of the platform after notification constitutes acceptance, where legally permitted.
• Where required, vendors must re‑accept updated terms before continuing to sell.

The system will log and store each vendor's agreement acceptance record, including version number and timestamp, for legal and compliance purposes.`;

  const customerTerms = `CALIFONIA EMPORIUM TERMS OF SERVICE
... (your customer terms here) ...`;

  const termsContent = type === 'vendor' ? vendorAgreement : customerTerms;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <SafeAreaView className="flex-1 bg-black/50">
        <View className="flex-1 bg-white mt-20 rounded-t-3xl">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              {type === 'vendor' ? 'Vendor Agreement' : 'Terms of Service'}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 p-4">
            <Text className="text-sm text-gray-700 font-mono">
              {termsContent}
            </Text>
          </ScrollView>

          {/* Footer with Accept Button */}
          <View className="p-4 border-t border-gray-200 space-y-2">
            <TouchableOpacity
              onPress={onAccept}
              className="bg-accent py-4 rounded-xl"
            >
              <Text className="text-white text-center font-semibold text-lg">
                I Agree to the {type === 'vendor' ? 'Vendor Agreement' : 'Terms of Service'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} className="py-2">
              <Text className="text-gray-500 text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default TermsModal;