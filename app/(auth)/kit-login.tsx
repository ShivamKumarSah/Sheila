import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, KeyRound, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function KitLoginScreen() {
  const [kitNumber, setKitNumber] = useState('SHEILA001');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!kitNumber) {
      Alert.alert('Error', 'Please enter your kit number');
      return;
    }

    setIsLoading(true);
    try {
      await signIn({ kitNumber });
    } catch (error) {
      Alert.alert('Authentication Failed', 'Invalid kit number');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#2563EB', '#7C3AED']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.contentContainer}>
        <Animated.View 
          entering={FadeIn.delay(300).duration(800)} 
          style={styles.header}
        >
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kit Login</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(500).duration(800)} 
          style={styles.formContainer}
        >
          <View style={styles.iconContainer}>
            <KeyRound size={32} color="#2563EB" />
          </View>
          
          <Text style={styles.title}>Enter Kit Number</Text>
          <Text style={styles.subtitle}>Please enter the unique number from your Sheila device</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="SHEILA-XXXXX"
              placeholderTextColor="#64748B"
              value={kitNumber}
              onChangeText={setKitNumber}
              autoCapitalize="characters"
            />
          </View>
          
          <Text style={styles.helpText}>
            The kit number can be found on the bottom of your Sheila device or in the included documentation.
          </Text>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Connecting...' : 'Connect Device'}
            </Text>
            {!isLoading && <ArrowRight size={20} color="#FFF" />}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 56,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  input: {
    flex: 1,
    color: '#1E293B',
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    textAlign: 'center',
    height: 56,
    letterSpacing: 2,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginRight: 8,
  },
});