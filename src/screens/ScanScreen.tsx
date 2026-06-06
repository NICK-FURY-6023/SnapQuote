import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import GlassContainer from '../components/GlassContainer';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { useTheme } from '../theme/ThemeProvider';
import { useQuotationStore } from '../stores/quotationStore';
import { spacing, fontSize, fontWeight, borderRadius } from '../theme/tokens';
import { RootStackParamList } from '../navigation/navigationRef';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ScanScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const [capturing, setCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePhoto({});

      if (photo?.path) {
        navigation.navigate('TextInput', { photoUri: `file://${photo.path}` });
      }
    } catch (err) {
      console.warn('Capture failed:', err);
    }
    setCapturing(false);
  };

  const handleTypeInstead = () => {
    navigation.navigate('TextInput');
  };

  // Camera not available (no back camera)
  if (!device) {
    return (
      <GlassContainer>
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <Icon name="camera-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.permissionText, { color: colors.text }]}>Camera not available</Text>
            <Text style={[styles.permissionSub, { color: colors.textSecondary }]}>
              No camera detected on this device.
            </Text>
            <GlassButton title="Type Instead" onPress={handleTypeInstead} style={{ marginTop: spacing.lg }} />
          </View>
        </SafeAreaView>
      </GlassContainer>
    );
  }

  if (!hasPermission) {
    return (
      <GlassContainer>
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <Icon name="camera-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.permissionText, { color: colors.text }]}>Camera access needed</Text>
            <Text style={[styles.permissionSub, { color: colors.textSecondary }]}>
              SnapQuote needs camera access to scan products for quotations.
            </Text>
            <GlassButton title="Grant Permission" onPress={requestPermission} style={{ marginTop: spacing.lg }} />
          </View>
        </SafeAreaView>
      </GlassContainer>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={[styles.topBar, { backgroundColor: colors.glass }]}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="close" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.topTitle, { color: colors.text }]}>Scan Product</Text>
              <View style={{ width: 28 }} />
            </View>
          </SafeAreaView>

          {/* Viewfinder frame */}
          <View style={styles.viewfinder}>
            <View style={[styles.frame, { borderColor: colors.accent }]}>
              <Text style={[styles.frameText, { color: '#FFFFFF' }]}>
                Point at product
              </Text>
            </View>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              onPress={handleTypeInstead}
              style={styles.skipBtn}
            >
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>Type instead</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCapture}
              disabled={capturing}
              style={[styles.captureBtn, { backgroundColor: colors.accent }]}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <View style={{ width: 80 }} />
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  permissionText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginTop: spacing.lg },
  permissionSub: { fontSize: fontSize.md, textAlign: 'center', marginTop: spacing.sm },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
  },
  topTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  viewfinder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  frameText: { fontSize: fontSize.md, opacity: 0.8 },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: spacing.xxl,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  skipBtn: { width: 80, alignItems: 'center' },
  skipText: { fontSize: fontSize.sm },
});
