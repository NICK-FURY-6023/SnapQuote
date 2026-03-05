import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useQuotationStore } from '../stores/quotationStore';

export const ScanScreen: React.FC = () => {
    const { colors, mode } = useTheme();
    const navigation = useNavigation<any>();
    const [permission, requestPermission] = useCameraPermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const { createNewQuotation, updateItem } = useQuotationStore();

    if (!permission) {
        return <View style={{ flex: 1, backgroundColor: colors.background }} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', padding: 20 }]}>
                <Text style={[styles.message, { color: colors.text }]}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={[styles.btn, { backgroundColor: colors.accent }]}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleCapture = async () => {
        if (!cameraRef.current) return;
        try {
            // Fake OCR process for UI prototype
            setIsProcessing(true);
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                base64: false,
            });

            // Simulate parsing delay (e.g. cloud API)
            setTimeout(() => {
                setIsProcessing(false);

                // Create a new quotation with "scanned" items
                createNewQuotation();

                // Add 2 dummy items pretending they were scanned
                updateItem(0, 'item_name', 'Scanned Item 1');
                updateItem(0, 'quantity', 2);
                updateItem(0, 'rate', 500);

                useQuotationStore.getState().addItem();
                updateItem(1, 'item_name', 'Scanned Item 2');
                updateItem(1, 'quantity', 5);
                updateItem(1, 'rate', 150);

                Alert.alert('Scan Complete', 'Extracted 2 items from image.');
                navigation.navigate('QuotationEditor', { isNew: false });
            }, 1500);

        } catch (error) {
            setIsProcessing(false);
            Alert.alert('Error', 'Failed to capture image');
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                ref={cameraRef}
            >
                {/* Header Overlay */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <Text style={styles.iconText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Scan Document</Text>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Text style={styles.iconText}>⚡</Text>
                    </TouchableOpacity>
                </View>

                {/* Viewfinder Frame */}
                <View style={styles.viewfinderContainer}>
                    <View style={styles.viewfinderFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <Text style={styles.instructionText}>
                        Align your quotation within the frame
                    </Text>
                </View>

                {/* Processing Overlay */}
                {isProcessing && (
                    <View style={styles.processingOverlay}>
                        <ActivityIndicator size="large" color="#3C3CF6" />
                        <Text style={styles.processingText}>Extracting text using AI...</Text>
                    </View>
                )}

                {/* Bottom Controls */}
                <View style={styles.bottomControls}>
                    <TouchableOpacity style={styles.secondaryBtn}>
                        <Text style={styles.secondaryBtnIcon}>🖼</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.captureBtnWrapper}
                        onPress={handleCapture}
                        disabled={isProcessing}
                    >
                        <View style={styles.captureBtnInner} />
                    </TouchableOpacity>

                    <View style={styles.secondaryBtn}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>AUTO</Text>
                    </View>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    message: { textAlign: 'center', marginBottom: 20, fontSize: 16 },
    btn: { padding: 16, borderRadius: 12, alignItems: 'center' },
    camera: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    iconBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    iconText: { fontSize: 20, color: '#FFFFFF' },
    viewfinderContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
    },
    viewfinderFrame: {
        width: '80%', height: '60%',
        position: 'relative',
    },
    corner: {
        position: 'absolute', width: 40, height: 40,
        borderColor: '#3C3CF6',
    },
    topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
    topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
    instructionText: {
        color: '#FFFFFF', fontSize: 14, fontWeight: '600',
        marginTop: 32, backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, overflow: 'hidden',
    },
    processingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 14, 39, 0.85)',
        justifyContent: 'center', alignItems: 'center',
    },
    processingText: {
        color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 16,
    },
    bottomControls: {
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        paddingBottom: 40, paddingTop: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    secondaryBtn: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    secondaryBtnIcon: { fontSize: 24 },
    captureBtnWrapper: {
        width: 80, height: 80, borderRadius: 40,
        borderWidth: 4, borderColor: '#FFFFFF',
        justifyContent: 'center', alignItems: 'center',
    },
    captureBtnInner: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF',
    },
});
