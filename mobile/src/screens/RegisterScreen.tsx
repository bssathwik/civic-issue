import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }: any) => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Basic Information (Step 1)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Personal Details (Step 2)
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');

  // Address Information (Step 3)
  const [address, setAddress] = useState({
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    ward: '',
    landmark: '',
  });
  const [location, setLocation] = useState({ coordinates: [0, 0] });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Emergency Contact (Step 4)
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relation: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);

  // Error states for modern validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Verification states
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, isLoading } = useAuth();

  // Timer for OTP resend
  React.useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Phone verification functions
  const sendPhoneOtp = async () => {
    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number first');
      return;
    }

    setIsVerifyingPhone(true);
    try {
      const { apiClient } = await import('../services/api');
      const response = await apiClient.sendPhoneVerification(phoneNumber);
      
      if (response.success) {
        setShowPhoneOtpInput(true);
        setOtpTimer(60); // 60 second countdown
        Alert.alert('OTP Sent', 'Please check your SMS for the verification code');
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send SMS. Please try again.');
      console.error('Phone OTP error:', error);
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    setIsVerifyingPhone(true);
    try {
      const { apiClient } = await import('../services/api');
      const response = await apiClient.verifyPhone(phoneNumber, phoneOtp);
      
      if (response.success) {
        setPhoneVerified(true);
        setShowPhoneOtpInput(false);
        Alert.alert('Success', 'Phone number verified successfully!');
      } else {
        Alert.alert('Error', response.message || 'Invalid OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Verification failed. Please try again.');
      console.error('Phone verification error:', error);
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  // Email verification functions
  const sendEmailOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address first');
      return;
    }

    setIsVerifyingEmail(true);
    try {
      const { apiClient } = await import('../services/api');
      const response = await apiClient.sendEmailVerification(email);
      
      if (response.success) {
        setShowEmailOtpInput(true);
        setOtpTimer(60); // 60 second countdown
        Alert.alert('OTP Sent', 'Please check your email for the verification code');
      } else {
        Alert.alert('Error', response.message || 'Failed to send verification email');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send email. Please try again.');
      console.error('Email OTP error:', error);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    setIsVerifyingEmail(true);
    try {
      const { apiClient } = await import('../services/api');
      const response = await apiClient.verifyEmail(email, emailOtp);
      
      if (response.success) {
        setEmailVerified(true);
        setShowEmailOtpInput(false);
        Alert.alert('Success', 'Email verified successfully!');
      } else {
        Alert.alert('Error', response.message || 'Invalid OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Verification failed. Please try again.');
      console.error('Email verification error:', error);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Modern validation functions
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'name':
        if (!value) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return 'Password must contain uppercase, lowercase and number';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
      case 'phoneNumber':
        if (!value) return 'Phone number is required';
        if (!/^[6-9]\d{9}$/.test(value)) return 'Please enter a valid 10-digit Indian mobile number';
        return '';
      case 'phoneVerification':
        if (!phoneVerified) return 'Please verify your phone number';
        return '';
      case 'emailVerification':
        if (!emailVerified) return 'Please verify your email address';
        return '';
      case 'gender':
        if (!value) return 'Please select your gender';
        return '';
      case 'occupation':
        if (!value) return 'Occupation is required';
        return '';
      case 'street':
        if (!value) return 'Street address is required';
        return '';
      case 'area':
        if (!value) return 'Area/Locality is required';
        return '';
      case 'city':
        if (!value) return 'City is required';
        return '';
      case 'state':
        if (!value) return 'State is required';
        return '';
      case 'pincode':
        if (!value) return 'Pincode is required';
        if (!/^[1-9][0-9]{5}$/.test(value)) return 'Please enter a valid 6-digit pincode';
        return '';
      case 'emergencyName':
        if (!value) return 'Emergency contact name is required';
        return '';
      case 'emergencyPhone':
        if (!value) return 'Emergency contact phone is required';
        if (!/^[6-9]\d{9}$/.test(value)) return 'Please enter a valid 10-digit phone number';
        return '';
      case 'emergencyRelation':
        if (!value) return 'Please select relationship';
        return '';
      case 'terms':
        if (!value) return 'Please accept the terms and conditions';
        return '';
      case 'privacy':
        if (!value) return 'Please accept the privacy policy';
        return '';
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    // Update touched state
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field and update errors
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateStep = (step: number): boolean => {
    let stepErrors: Record<string, string> = {};
    let hasErrors = false;

    switch (step) {
      case 1:
        const step1Fields = { name, email, password, confirmPassword, phoneNumber };
        Object.entries(step1Fields).forEach(([key, value]) => {
          const error = validateField(key, value);
          if (error) {
            stepErrors[key] = error;
            hasErrors = true;
          }
        });
        
        // Check verification status
        if (!emailVerified) {
          stepErrors.emailVerification = 'Please verify your email address';
          hasErrors = true;
        }
        if (!phoneVerified) {
          stepErrors.phoneVerification = 'Please verify your phone number';
          hasErrors = true;
        }
        break;
      case 2:
        const age = new Date().getFullYear() - dateOfBirth.getFullYear();
        if (age < 18) {
          stepErrors.dateOfBirth = 'You must be at least 18 years old to register';
          hasErrors = true;
        }
        const step2Fields = { gender, occupation };
        Object.entries(step2Fields).forEach(([key, value]) => {
          const error = validateField(key, value);
          if (error) {
            stepErrors[key] = error;
            hasErrors = true;
          }
        });
        break;
      case 3:
        const step3Fields = {
          street: address.street,
          area: address.area,
          city: address.city,
          state: address.state,
          pincode: address.pincode
        };
        Object.entries(step3Fields).forEach(([key, value]) => {
          const error = validateField(key, value);
          if (error) {
            stepErrors[key] = error;
            hasErrors = true;
          }
        });
        break;
      case 4:
        const step4Fields = {
          emergencyName: emergencyContact.name,
          emergencyPhone: emergencyContact.phone,
          emergencyRelation: emergencyContact.relation
        };
        Object.entries(step4Fields).forEach(([key, value]) => {
          const error = validateField(key, value);
          if (error) {
            stepErrors[key] = error;
            hasErrors = true;
          }
        });
        if (!agreeToTerms) {
          stepErrors.terms = 'Please accept the terms and conditions';
          hasErrors = true;
        }
        if (!agreeToPrivacy) {
          stepErrors.privacy = 'Please accept the privacy policy';
          hasErrors = true;
        }
        break;
    }

    if (hasErrors) {
      setErrors(prev => ({ ...prev, ...stepErrors }));
      // Mark all fields as touched for this step
      const touchedFields: Record<string, boolean> = {};
      Object.keys(stepErrors).forEach(key => {
        touchedFields[key] = true;
      });
      setTouched(prev => ({ ...prev, ...touchedFields }));
    }

    return !hasErrors;
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for registration');
        setIsLoadingLocation(false);
        return;
      }

      let locationResult = await Location.getCurrentPositionAsync({});
      setLocation({
        coordinates: [locationResult.coords.longitude, locationResult.coords.latitude]
      });

      // Get address from coordinates
      let addressResult = await Location.reverseGeocodeAsync({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      });

      if (addressResult.length > 0) {
        const addr = addressResult[0];
        setAddress(prev => ({
          ...prev,
          street: addr.street || prev.street,
          area: addr.district || prev.area,
          city: addr.city || prev.city,
          state: addr.region || prev.state,
          pincode: addr.postalCode || prev.pincode,
        }));
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to get current location');
      console.error('Location error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Modern Error Text Component
  const ErrorText = ({ field }: { field: string }) => {
    if (!touched[field] || !errors[field]) return null;
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={16} color="#dc3545" />
        <Text style={styles.errorText}>{errors[field]}</Text>
      </View>
    );
  };

  // Success Toast Component
  const SuccessToast = () => {
    if (!showSuccessToast) return null;
    return (
      <View style={styles.successToast}>
        <Ionicons name="checkmark-circle" size={24} color="#28a745" />
        <Text style={styles.successToastText}>Registration Successful!</Text>
        <Text style={styles.successToastSubtext}>Creating your citizen profile...</Text>
      </View>
    );
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleRegister = async () => {
    if (!validateStep(4)) return;

    try {
      const registrationData = {
        name,
        email,
        password,
        confirmPassword,
        phone: phoneNumber,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        gender,
        occupation,
        ...(aadharNumber && { aadharNumber }),
        address,
        location,
        emergencyContact,
        agreeToTerms,
        agreeToPrivacy,
      };

      const result = await register(registrationData);
      
      if (result.success) {
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          navigation.navigate('MainTabs');
        }, 2000);
      } else {
        Alert.alert('Registration Failed', result.message || 'Please check your information and try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View key={i} style={[
          styles.stepDot,
          currentStep === i + 1 && styles.activeStepDot,
          currentStep > i + 1 && styles.completedStepDot
        ]} />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Basic Information</Text>
      
      <TextInput
        style={[styles.input, touched.name && errors.name && styles.inputError]}
        placeholder="Full Name *"
        value={name}
        onChangeText={(text) => {
          setName(text);
          handleFieldChange('name', text);
        }}
        onBlur={() => handleFieldChange('name', name)}
      />
      <ErrorText field="name" />

      {/* Email with Verification */}
      <View style={styles.verificationContainer}>
        <TextInput
          style={[
            styles.input, 
            styles.verificationInput,
            touched.email && errors.email && styles.inputError,
            emailVerified && styles.verifiedInput
          ]}
          placeholder="Email Address *"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            handleFieldChange('email', text);
            setEmailVerified(false); // Reset verification when email changes
            setShowEmailOtpInput(false);
          }}
          onBlur={() => handleFieldChange('email', email)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!emailVerified}
        />
        <TouchableOpacity
          style={[
            styles.verificationButton,
            emailVerified && styles.verifiedButton,
            isVerifyingEmail && styles.buttonDisabled
          ]}
          onPress={emailVerified ? undefined : sendEmailOtp}
          disabled={isVerifyingEmail || emailVerified || !email}
        >
          {isVerifyingEmail ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons 
                name={emailVerified ? "checkmark-circle" : "mail"} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.verificationButtonText}>
                {emailVerified ? 'Verified' : 'Verify'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <ErrorText field="email" />
      {!emailVerified && touched.emailVerification && (
        <View style={styles.verificationWarning}>
          <Ionicons name="warning" size={16} color="#ff8c00" />
          <Text style={styles.verificationWarningText}>Email verification required to proceed</Text>
        </View>
      )}

      {/* Email OTP Input */}
      {showEmailOtpInput && !emailVerified && (
        <View style={styles.otpContainer}>
          <TextInput
            style={styles.otpInput}
            placeholder="Enter 6-digit email OTP"
            value={emailOtp}
            onChangeText={setEmailOtp}
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.otpVerifyButton, isVerifyingEmail && styles.buttonDisabled]}
            onPress={verifyEmailOtp}
            disabled={isVerifyingEmail}
          >
            {isVerifyingEmail ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.otpButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
          {otpTimer > 0 && (
            <Text style={styles.timerText}>Resend in {otpTimer}s</Text>
          )}
          {otpTimer === 0 && (
            <TouchableOpacity onPress={sendEmailOtp}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.passwordInput, touched.password && errors.password && styles.inputError]}
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            handleFieldChange('password', text);
          }}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          onBlur={() => handleFieldChange('password', password)}
        />
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIconInside}
        >
          <Ionicons 
            name={showPassword ? "eye-outline" : "eye-off-outline"} 
            size={20} 
            color="#6b7280" 
          />
        </TouchableOpacity>
      </View>
      <ErrorText field="password" />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.passwordInput, touched.confirmPassword && errors.confirmPassword && styles.inputError]}
          placeholder="Confirm Password"
          placeholderTextColor="#9ca3af"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            handleFieldChange('confirmPassword', text);
          }}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          onBlur={() => handleFieldChange('confirmPassword', confirmPassword)}
        />
        <TouchableOpacity 
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIconInside}
        >
          <Ionicons 
            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
            size={20} 
            color="#6b7280" 
          />
        </TouchableOpacity>
      </View>
      <ErrorText field="confirmPassword" />

      {/* Phone with Verification */}
      <View style={styles.verificationContainer}>
        <TextInput
          style={[
            styles.input, 
            styles.verificationInput,
            touched.phoneNumber && errors.phoneNumber && styles.inputError,
            phoneVerified && styles.verifiedInput
          ]}
          placeholder="Phone Number *"
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text);
            handleFieldChange('phoneNumber', text);
            setPhoneVerified(false); // Reset verification when phone changes
            setShowPhoneOtpInput(false);
          }}
          onBlur={() => handleFieldChange('phoneNumber', phoneNumber)}
          keyboardType="phone-pad"
          maxLength={10}
          editable={!phoneVerified}
        />
        <TouchableOpacity
          style={[
            styles.verificationButton,
            phoneVerified && styles.verifiedButton,
            isVerifyingPhone && styles.buttonDisabled
          ]}
          onPress={phoneVerified ? undefined : sendPhoneOtp}
          disabled={isVerifyingPhone || phoneVerified || !phoneNumber}
        >
          {isVerifyingPhone ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons 
                name={phoneVerified ? "checkmark-circle" : "call"} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.verificationButtonText}>
                {phoneVerified ? 'Verified' : 'Verify'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <ErrorText field="phoneNumber" />
      {!phoneVerified && touched.phoneVerification && (
        <View style={styles.verificationWarning}>
          <Ionicons name="warning" size={16} color="#ff8c00" />
          <Text style={styles.verificationWarningText}>Phone verification required to proceed</Text>
        </View>
      )}

      {/* Phone OTP Input */}
      {showPhoneOtpInput && !phoneVerified && (
        <View style={styles.otpContainer}>
          <TextInput
            style={styles.otpInput}
            placeholder="Enter 6-digit SMS OTP"
            value={phoneOtp}
            onChangeText={setPhoneOtp}
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.otpVerifyButton, isVerifyingPhone && styles.buttonDisabled]}
            onPress={verifyPhoneOtp}
            disabled={isVerifyingPhone}
          >
            {isVerifyingPhone ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.otpButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
          {otpTimer > 0 && (
            <Text style={styles.timerText}>Resend in {otpTimer}s</Text>
          )}
          {otpTimer === 0 && (
            <TouchableOpacity onPress={sendPhoneOtp}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Personal Details</Text>
      
      <TouchableOpacity
        style={[styles.input, touched.dateOfBirth && errors.dateOfBirth && styles.inputError]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>
          Date of Birth: {dateOfBirth.toDateString()} *
        </Text>
      </TouchableOpacity>
      <ErrorText field="dateOfBirth" />

      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <View style={[styles.pickerContainer, touched.gender && errors.gender && styles.inputError]}>
        <Picker
          selectedValue={gender}
          onValueChange={(value) => {
            setGender(value);
            handleFieldChange('gender', value);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select Gender *" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
          <Picker.Item label="Prefer not to say" value="prefer_not_to_say" />
        </Picker>
      </View>
      <ErrorText field="gender" />

      <TextInput
        style={[styles.input, touched.occupation && errors.occupation && styles.inputError]}
        placeholder="Occupation *"
        value={occupation}
        onChangeText={(text) => {
          setOccupation(text);
          handleFieldChange('occupation', text);
        }}
        onBlur={() => handleFieldChange('occupation', occupation)}
      />
      <ErrorText field="occupation" />

      <TextInput
        style={styles.input}
        placeholder="Aadhar Number (optional)"
        value={aadharNumber}
        onChangeText={setAadharNumber}
        keyboardType="numeric"
        maxLength={12}
      />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Address Information</Text>
      
      <TouchableOpacity
        style={[styles.locationButton, isLoadingLocation && styles.buttonDisabled]}
        onPress={getCurrentLocation}
        disabled={isLoadingLocation}
      >
        {isLoadingLocation ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="location-outline" size={20} color="#fff" />
            <Text style={styles.locationButtonText}>Get Current Location</Text>
          </>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Street Address *"
        value={address.street}
        onChangeText={(text) => setAddress(prev => ({ ...prev, street: text }))}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Area/Locality *"
        value={address.area}
        onChangeText={(text) => setAddress(prev => ({ ...prev, area: text }))}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="City *"
          value={address.city}
          onChangeText={(text) => setAddress(prev => ({ ...prev, city: text }))}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="State *"
          value={address.state}
          onChangeText={(text) => setAddress(prev => ({ ...prev, state: text }))}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Pincode *"
          value={address.pincode}
          onChangeText={(text) => setAddress(prev => ({ ...prev, pincode: text }))}
          keyboardType="numeric"
          maxLength={6}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Ward (optional)"
          value={address.ward}
          onChangeText={(text) => setAddress(prev => ({ ...prev, ward: text }))}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Landmark (optional)"
        value={address.landmark}
        onChangeText={(text) => setAddress(prev => ({ ...prev, landmark: text }))}
      />
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Emergency Contact & Preferences</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Emergency Contact Name *"
        value={emergencyContact.name}
        onChangeText={(text) => setEmergencyContact(prev => ({ ...prev, name: text }))}
      />

      <TextInput
        style={styles.input}
        placeholder="Emergency Contact Phone *"
        value={emergencyContact.phone}
        onChangeText={(text) => setEmergencyContact(prev => ({ ...prev, phone: text }))}
        keyboardType="phone-pad"
        maxLength={10}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={emergencyContact.relation}
          onValueChange={(value) => setEmergencyContact(prev => ({ ...prev, relation: value }))}
          style={styles.picker}
        >
          <Picker.Item label="Select Relationship *" value="" />
          <Picker.Item label="Father" value="father" />
          <Picker.Item label="Mother" value="mother" />
          <Picker.Item label="Spouse" value="spouse" />
          <Picker.Item label="Sibling" value="sibling" />
          <Picker.Item label="Child" value="child" />
          <Picker.Item label="Friend" value="friend" />
          <Picker.Item label="Relative" value="relative" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[styles.checkbox, agreeToTerms && styles.checkedBox, touched.terms && errors.terms && styles.checkboxError]}
          onPress={() => {
            setAgreeToTerms(!agreeToTerms);
            handleFieldChange('terms', !agreeToTerms);
          }}
        >
          {agreeToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
        </TouchableOpacity>
        <Text style={styles.checkboxText}>I agree to the Terms & Conditions *</Text>
      </View>
      <ErrorText field="terms" />

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[styles.checkbox, agreeToPrivacy && styles.checkedBox, touched.privacy && errors.privacy && styles.checkboxError]}
          onPress={() => {
            setAgreeToPrivacy(!agreeToPrivacy);
            handleFieldChange('privacy', !agreeToPrivacy);
          }}
        >
          {agreeToPrivacy && <Ionicons name="checkmark" size={16} color="#fff" />}
        </TouchableOpacity>
        <Text style={styles.checkboxText}>I agree to the Privacy Policy *</Text>
      </View>
      <ErrorText field="privacy" />
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Complete Registration</Text>
        <Text style={styles.subtitle}>Step {currentStep} of {totalSteps}</Text>
        
        {renderStepIndicator()}
        
        {renderCurrentStep()}

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
              <Text style={styles.secondaryButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          {currentStep < totalSteps ? (
            <TouchableOpacity style={styles.button} onPress={nextStep}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Complete Registration</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('LoginScreen')}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <SuccessToast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginHorizontal: 6,
  },
  activeStepDot: {
    backgroundColor: '#007BFF',
  },
  completedStepDot: {
    backgroundColor: '#28a745',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e6ed',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fef7f7',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e6ed',
  },
  picker: {
    height: 50,
  },
  dateText: {
    color: '#333',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  locationButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007BFF',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#007BFF',
  },
  checkboxError: {
    borderColor: '#dc3545',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    marginLeft: 5,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    marginRight: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#007BFF',
    fontSize: 16,
  },
  successToast: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  successToastText: {
    color: '#155724',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  successToastSubtext: {
    color: '#155724',
    fontSize: 14,
    marginLeft: 12,
    opacity: 0.8,
  },
  // Verification styles
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  verificationInput: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  verifiedInput: {
    backgroundColor: '#f8fff8',
    borderColor: '#28a745',
  },
  verificationButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 85,
    justifyContent: 'center',
  },
  verifiedButton: {
    backgroundColor: '#28a745',
  },
  verificationButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e6ed',
  },
  otpInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  otpVerifyButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  otpButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  resendText: {
    fontSize: 12,
    color: '#007BFF',
    marginLeft: 10,
    textDecorationLine: 'underline',
  },
  verificationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    padding: 8,
    borderRadius: 6,
    marginTop: -10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#ff8c00',
  },
  verificationWarningText: {
    color: '#e65100',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  eyeButtonContainer: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  eyeButton: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordContainer: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e6ed',
    marginBottom: 15,
  },
  passwordInput: {
    fontSize: 16,
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50,
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  eyeIconInside: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e6ed',
    padding: 10,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
});

export default RegisterScreen;