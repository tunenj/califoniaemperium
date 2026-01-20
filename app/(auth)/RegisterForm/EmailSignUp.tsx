import images from '@/constants/images';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const isMounted = useRef(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
  });

  /* ───────────────────────────
     Lifecycle safety
  ─────────────────────────── */
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /* ───────────────────────────
     Validation helpers
  ─────────────────────────── */
  const validateEmail = useCallback((value: string) => {
    if (!value.trim()) {
      if (!isMounted.current) return false;
      setEmailError('');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(value);

    if (!isMounted.current) return valid;

    setEmailError(valid ? '' : 'Please enter a valid email address');
    return valid;
  }, []);

  const validatePassword = useCallback((value: string) => {
    const validations = {
      minLength: value.length >= 8,
      hasUpperCase: /[A-Z]/.test(value),
      hasLowerCase: /[a-z]/.test(value),
      hasNumbers: /\d/.test(value),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    };

    if (!isMounted.current) return false;

    setPasswordValidations(validations);
    return Object.values(validations).every(Boolean);
  }, []);

  /* ───────────────────────────
     Effects
  ─────────────────────────── */
  useEffect(() => {
    validateEmail(email);
  }, [email, validateEmail]);

  useEffect(() => {
    validatePassword(password);
  }, [password, validatePassword]);

  /* ───────────────────────────
     Submit availability
  ─────────────────────────── */
  const canSubmit = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const emailOk = email.trim() !== '' && emailRegex.test(email);

    const passwordOk =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return emailOk && passwordOk;
  }, [email, password]);

  /* ───────────────────────────
     Navigation
  ─────────────────────────── */
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleSignIn = () => {
    router.push('/signIn');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  /* ───────────────────────────
     Mock API
  ─────────────────────────── */
  const checkEmailExists = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return false;
  };

  /* ───────────────────────────
     Continue
  ─────────────────────────── */
  const handleContinue = async () => {
    if (!canSubmit || isLoading) return;

    setIsLoading(true);

    try {
      const emailExists = await checkEmailExists();

      if (!isMounted.current) return;

      if (emailExists) {
        Alert.alert(
          'Email Already Registered',
          'This email is already registered. Would you like to sign in instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: handleSignIn },
          ]
        );
        return;
      }

      router.push({
        pathname: '/OtpVerification',
        params: {
          email,
          source: 'email',
          role: isCustomer ? 'customer' : 'business',
          method: 'email',
        },
      });
    } catch {
      if (!isMounted.current) return;

      Alert.alert(
        'Registration Failed',
        'Unable to proceed with registration. Please try again.'
      );
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const renderValidationIcon = (isValid: boolean) =>
    isValid ? (
      <CheckCircle size={16} color="#10B981" />
    ) : (
      <XCircle size={16} color="#EF4444" />
    );

  /* ───────────────────────────
     UI (UNCHANGED)
  ─────────────────────────── */
  return (
    <View className="flex-1 bg-white">
      <View className="bg-secondary h-1/3 min-h-[250px] relative">
        <View className="flex-1 items-center justify-center">
          <Image
            source={images.onboarding}
            className="w-16 h-16"
            resizeMode="contain"
          />
        </View>
      </View>

      <View className="flex-1 bg-white -mt-8 rounded-t-3xl px-6 pt-8">
        <View className="relative">
          <TouchableOpacity
            className="absolute top-0 left-0 p-2 z-10"
            onPress={handleBack}
            disabled={isLoading}
          >
            <ArrowLeft size={28} color="#C62828" />
          </TouchableOpacity>

          <View className="mb-8 items-center">
            <Text className="text-2xl font-bold text-black mb-1">
              {isCustomer ? 'Register as Customer' : 'Register as Business'}
            </Text>

            <TouchableOpacity
              className="flex-row items-center mt-2"
              onPress={() => setIsCustomer(prev => !prev)}
              disabled={isLoading}
            >
              <Image
                source={images.switchIcon}
                className="w-6 h-6 mr-2"
                resizeMode="contain"
              />
              <Text className="text-lg text-gray-400 font-medium underline">
                {isCustomer ? 'Switch to Business' : 'Switch to Customer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Email */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm mb-1">Email</Text>
          <TextInput
            className={`bg-gray-100 rounded-xl px-4 py-4 text-base border ${
              emailError && email.trim()
                ? 'border-red-300'
                : 'border-gray-200'
            }`}
            placeholder="Enter your email"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          {emailError && email.trim() ? (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {emailError}
            </Text>
          ) : null}
        </View>

        {/* Password */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm mb-1">Create Password</Text>
          <View className="relative">
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-4 text-base pr-12 border border-gray-200"
              placeholder="Create a strong password"
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff size={24} color="#666" />
              ) : (
                <Eye size={24} color="#666" />
              )}
            </TouchableOpacity>
          </View>

          {password.length > 0 && (
            <View className="mt-4 space-y-2">
              <View className="flex-row items-center">
                {renderValidationIcon(passwordValidations.minLength)}
                <Text className="ml-2 text-sm text-gray-500">
                  At least 8 characters
                </Text>
              </View>
              <View className="flex-row items-center">
                {renderValidationIcon(passwordValidations.hasUpperCase)}
                <Text className="ml-2 text-sm text-gray-500">
                  One uppercase letter
                </Text>
              </View>
              <View className="flex-row items-center">
                {renderValidationIcon(passwordValidations.hasLowerCase)}
                <Text className="ml-2 text-sm text-gray-500">
                  One lowercase letter
                </Text>
              </View>
              <View className="flex-row items-center">
                {renderValidationIcon(passwordValidations.hasNumbers)}
                <Text className="ml-2 text-sm text-gray-500">
                  One number
                </Text>
              </View>
              <View className="flex-row items-center">
                {renderValidationIcon(passwordValidations.hasSpecialChar)}
                <Text className="ml-2 text-sm text-gray-500">
                  One special character (!@#$%^&*)
                </Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          className={`rounded-xl py-4 items-center mb-8 ${
            canSubmit && !isLoading ? 'bg-secondary' : 'bg-gray-300'
          }`}
          onPress={handleContinue}
          disabled={!canSubmit || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              className={`text-lg font-semibold ${
                canSubmit ? 'text-white' : 'text-gray-500'
              }`}
            >
              Continue
            </Text>
          )}
        </TouchableOpacity>

        <View className="items-center pb-6">
          <TouchableOpacity onPress={handleSignIn} disabled={isLoading}>
            <Text className="text-gray-600 text-base">
              Already have an account?{' '}
              <Text className="text-secondary font-semibold">Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RegisterForm;
