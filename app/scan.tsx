import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import GlassContainer from '../src/components/GlassContainer';
import GlassCard from '../src/components/GlassCard';
import GlassButton from '../src/components/GlassButton';
import { useTheme } from '../src/theme/ThemeProvider';
import { useQuotationStore } from '../src/stores/quotationStore';
import { spacing, fontSize, fontWeight, borderRadius } from '../src/theme/tokens';

export default function ScanScreen() {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (photo?.uri) {
        // Save photo locally for later OCR processing
        // Full Cloud Vision OCR integration will be done in the services layer
        router.push({
          pathname: '/text-input',
          params: { photoUri: photo.uri },
        });
      }
    } catch (err) {
      console.warn('Capture failed:', err);
    }
    setCapturing(false);
  };

  if (!permission) {
    return (
      <GlassContainer>
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <Text style={[{ color: colors.textSecondary }]}>Camera loading...</Text>
          </View>
        </SafeAreaView>
      </GlassContainer>
    );
  }

  if (!permission.granted) {
    return (
      <GlassContainer>
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
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
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={false}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={[styles.topBar, { backgroundColor: colors.glass }]}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="close" size={28} color={colors.text} />
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
              onPress={() => router.push('/text-input')}
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
      </CameraView>
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
