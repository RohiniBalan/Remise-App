import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  Image,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Check,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Crop,
  Sparkles,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOX_SIZE = Math.min(SCREEN_WIDTH - 40, 340);
const OUTPUT_SIZE = 1000; // 1:1 High resolution square export

export interface CroppedImageResult {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  type: string;
  fileName: string;
  originalUri?: string;
  originalBase64?: string;
}

export interface ImageCropModalProps {
  visible: boolean;
  imageUri: string | null;
  imageBase64?: string;
  imageWidth?: number;
  imageHeight?: number;
  title?: string;
  onConfirm: (result: CroppedImageResult) => void;
  onCancel: () => void;
  onRetake?: () => void;
}

const HTML_WORKER = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>body { margin:0; padding:0; background:#000; overflow:hidden; }</style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    function doCrop(msg) {
      try {
        var data = typeof msg === 'string' ? JSON.parse(msg) : msg;
        var imgSrc = data.imgSrc;
        var sx = Math.max(0, data.sx || 0);
        var sy = Math.max(0, data.sy || 0);
        var sw = data.sw;
        var sh = data.sh;
        var outSize = data.outSize || 1000;

        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
          var natW = img.naturalWidth || img.width;
          var natH = img.naturalHeight || img.height;

          // Safe clamping
          if (!sw || sw > natW) sw = natW;
          if (!sh || sh > natH) sh = natH;
          if (sx + sw > natW) sx = Math.max(0, natW - sw);
          if (sy + sh > natH) sy = Math.max(0, natH - sh);

          var canvas = document.getElementById('c');
          canvas.width = outSize;
          canvas.height = outSize;
          var ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outSize, outSize);
          var dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          var rawBase64 = dataUrl.replace(/^data:image\\/[a-z]+;base64,/, '');

          var response = {
            type: 'CROP_SUCCESS',
            dataUrl: dataUrl,
            base64: rawBase64,
            width: outSize,
            height: outSize
          };
          window.ReactNativeWebView.postMessage(JSON.stringify(response));
        };
        img.onerror = function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CROP_ERROR',
            error: 'Failed to load image in worker canvas'
          }));
        };
        img.src = imgSrc;
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'CROP_ERROR',
          error: e.message || 'Worker processing error'
        }));
      }
    }

    // Support both iOS and Android message dispatching
    window.addEventListener('message', function(e) { doCrop(e.data); });
    document.addEventListener('message', function(e) { doCrop(e.data); });
  </script>
</body>
</html>
`;

export default function ImageCropModal({
  visible,
  imageUri,
  imageBase64,
  imageWidth: initialWidth,
  imageHeight: initialHeight,
  title = 'Crop & Center Product',
  onConfirm,
  onCancel,
  onRetake,
}: ImageCropModalProps) {
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({
    width: initialWidth || 0,
    height: initialHeight || 0,
  });
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const [workerReady, setWorkerReady] = useState(false);

  const webViewRef = useRef<any>(null);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomRef = useRef<number>(1);
  const dimsRef = useRef<{ width: number; height: number }>({ width: initialWidth || 0, height: initialHeight || 0 });

  // Sync refs
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    dimsRef.current = naturalDimensions;
  }, [naturalDimensions]);

  // Fetch true dimensions of the image if not passed
  useEffect(() => {
    if (!visible || !imageUri) return;

    setZoom(1);
    setPan({ x: 0, y: 0 });
    setProcessing(false);

    if (initialWidth && initialHeight && initialWidth > 0 && initialHeight > 0) {
      setNaturalDimensions({ width: initialWidth, height: initialHeight });
      return;
    }

    const fullSrc = imageBase64 && !imageUri.startsWith('http')
      ? (imageUri.startsWith('data:') ? imageUri : `data:image/jpeg;base64,${imageBase64}`)
      : imageUri;

    Image.getSize(
      fullSrc,
      (width, height) => {
        setNaturalDimensions({ width, height });
      },
      () => {
        // Fallback default aspect ratio (4:3) if getSize fails
        setNaturalDimensions({ width: 1200, height: 900 });
      }
    );
  }, [visible, imageUri, imageBase64, initialWidth, initialHeight]);

  const { natW, natH, baseScale, dispW, dispH, maxPanX, maxPanY } = useMemo(() => {
    const w = naturalDimensions.width || 1000;
    const h = naturalDimensions.height || 1000;
    const scale = Math.max(BOX_SIZE / w, BOX_SIZE / h);
    const totalScale = scale * zoom;
    const dW = w * totalScale;
    const dH = h * totalScale;
    const maxX = Math.max(0, (dW - BOX_SIZE) / 2);
    const maxY = Math.max(0, (dH - BOX_SIZE) / 2);

    return {
      natW: w,
      natH: h,
      baseScale: scale,
      dispW: dW,
      dispH: dH,
      maxPanX: maxX,
      maxPanY: maxY,
    };
  }, [naturalDimensions, zoom]);

  const clampPan = useCallback(
    (rawX: number, rawY: number, z: number) => {
      const scale = baseScale * z;
      const dW = natW * scale;
      const dH = natH * scale;
      const maxX = Math.max(0, (dW - BOX_SIZE) / 2);
      const maxY = Math.max(0, (dH - BOX_SIZE) / 2);

      return {
        x: Math.max(-maxX, Math.min(maxX, rawX)),
        y: Math.max(-maxY, Math.min(maxY, rawY)),
      };
    },
    [baseScale, natW, natH]
  );

  // Pan Responder for dragging inside square viewport
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {},
        onPanResponderMove: (_, gestureState) => {
          const nextX = panRef.current.x + gestureState.dx;
          const nextY = panRef.current.y + gestureState.dy;
          const clamped = clampPan(nextX, nextY, zoomRef.current);
          setPan(clamped);
        },
        onPanResponderRelease: () => {},
      }),
    [clampPan]
  );

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.min(3, Math.max(1, Number(newZoom.toFixed(2))));
    setZoom(clampedZoom);
    setPan(prev => clampPan(prev.x, prev.y, clampedZoom));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleConfirmCrop = () => {
    if (!imageUri || processing) return;

    setProcessing(true);

    const fullSrc = imageBase64 && !imageUri.startsWith('http')
      ? (imageUri.startsWith('data:') ? imageUri : `data:image/jpeg;base64,${imageBase64}`)
      : imageUri;

    const totalScale = baseScale * zoom;
    let srcCropSize = BOX_SIZE / totalScale;
    if (srcCropSize > Math.min(natW, natH)) {
      srcCropSize = Math.min(natW, natH);
    }

    const centerSrcX = natW / 2 - pan.x / totalScale;
    const centerSrcY = natH / 2 - pan.y / totalScale;

    let srcCropX = centerSrcX - srcCropSize / 2;
    let srcCropY = centerSrcY - srcCropSize / 2;

    srcCropX = Math.max(0, Math.min(natW - srcCropSize, srcCropX));
    srcCropY = Math.max(0, Math.min(natH - srcCropSize, srcCropY));

    const payload = JSON.stringify({
      imgSrc: fullSrc,
      sx: Math.round(srcCropX),
      sy: Math.round(srcCropY),
      sw: Math.round(srcCropSize),
      sh: Math.round(srcCropSize),
      outSize: OUTPUT_SIZE,
    });

    if (webViewRef.current) {
      webViewRef.current.postMessage(payload);
    } else {
      // Emergency fallback if webview is unavailable
      setProcessing(false);
      onConfirm({
        uri: fullSrc,
        base64: imageBase64,
        width: natW,
        height: natH,
        type: 'image/jpeg',
        fileName: `product-${Date.now()}.jpg`,
        originalUri: imageUri,
        originalBase64: imageBase64,
      });
    }
  };

  const handleWorkerMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'CROP_SUCCESS') {
        setProcessing(false);
        onConfirm({
          uri: data.dataUrl,
          base64: data.base64,
          width: OUTPUT_SIZE,
          height: OUTPUT_SIZE,
          type: 'image/jpeg',
          fileName: `product-${Date.now()}.jpg`,
          originalUri: imageUri || undefined,
          originalBase64: imageBase64,
        });
      } else if (data.type === 'CROP_ERROR') {
        console.warn('[ImageCropModal] Worker error:', data.error);
        setProcessing(false);
        // Fallback to original image
        onConfirm({
          uri: imageUri || '',
          base64: imageBase64,
          width: natW,
          height: natH,
          type: 'image/jpeg',
          fileName: `product-${Date.now()}.jpg`,
          originalUri: imageUri || undefined,
          originalBase64: imageBase64,
        });
      }
    } catch (e: any) {
      console.warn('[ImageCropModal] Failed to parse worker message:', e);
      setProcessing(false);
    }
  };

  if (!visible || !imageUri) return null;

  const imgSrc = imageBase64 && !imageUri.startsWith('http')
    ? (imageUri.startsWith('data:') ? imageUri : `data:image/jpeg;base64,${imageBase64}`)
    : imageUri;

  const imageLeft = (BOX_SIZE - dispW) / 2 + pan.x;
  const imageTop = (BOX_SIZE - dispH) / 2 + pan.y;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.backdrop}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>1:1 Square Frame · Product Centered</Text>
          </View>
          <TouchableOpacity onPress={onCancel} style={styles.closeBtn} disabled={processing}>
            <X size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Viewfinder Area */}
        <View style={styles.viewportContainer}>
          <View style={[styles.box, { width: BOX_SIZE, height: BOX_SIZE }]} {...panResponder.panHandlers}>
            {/* Image Layer */}
            <Image
              source={{ uri: imgSrc }}
              style={{
                width: dispW,
                height: dispH,
                position: 'absolute',
                left: imageLeft,
                top: imageTop,
              }}
              resizeMode="stretch"
            />

            {/* Rule of Thirds Grid Guidelines */}
            <View style={styles.gridOverlay} pointerEvents="none">
              <View style={styles.gridRow}>
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
                <View style={[styles.gridCell, { borderRightWidth: 0 }]} />
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
                <View style={[styles.gridCell, { borderRightWidth: 0 }]} />
              </View>
              <View style={[styles.gridRow, { borderBottomWidth: 0 }]}>
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
                <View style={[styles.gridCell, { borderRightWidth: 0 }]} />
              </View>
            </View>

            {/* 1:1 Corner Accents */}
            <View style={[styles.corner, styles.cornerTL]} pointerEvents="none" />
            <View style={[styles.corner, styles.cornerTR]} pointerEvents="none" />
            <View style={[styles.corner, styles.cornerBL]} pointerEvents="none" />
            <View style={[styles.corner, styles.cornerBR]} pointerEvents="none" />

            {/* Center Crosshair */}
            <View style={styles.crosshair} pointerEvents="none">
              <View style={styles.crosshairH} />
              <View style={styles.crosshairV} />
            </View>

            {/* Hint Badge */}
            <View style={styles.hintBadge} pointerEvents="none">
              <Text style={styles.hintBadgeText}>Drag to reposition · 1:1 Square</Text>
            </View>
          </View>
        </View>

        {/* Controls Bar */}
        <View style={styles.controlsBar}>
          <View style={styles.zoomRow}>
            <TouchableOpacity
              onPress={() => handleZoomChange(zoom - 0.2)}
              style={styles.iconBtn}
              disabled={zoom <= 1 || processing}
            >
              <ZoomOut size={18} color={zoom <= 1 ? '#475569' : '#E2E8F0'} />
            </TouchableOpacity>

            <View style={styles.zoomBadge}>
              <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
            </View>

            <TouchableOpacity
              onPress={() => handleZoomChange(zoom + 0.2)}
              style={styles.iconBtn}
              disabled={zoom >= 3 || processing}
            >
              <ZoomIn size={18} color={zoom >= 3 ? '#475569' : '#E2E8F0'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReset}
              style={styles.resetBtn}
              disabled={processing}
            >
              <RotateCcw size={14} color="#94A3B8" />
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons Footer */}
        <View style={styles.footer}>
          {onRetake ? (
            <TouchableOpacity
              onPress={onRetake}
              style={styles.retakeBtn}
              disabled={processing}
            >
              <RefreshCw size={15} color="#E2E8F0" />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onCancel}
              style={styles.cancelBtn}
              disabled={processing}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleConfirmCrop}
            style={[styles.confirmBtn, processing && { opacity: 0.7 }]}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Check size={16} color="#FFFFFF" />
                <Text style={styles.confirmBtnText}>Confirm & Use Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Offscreen HTML5 Canvas Crop Worker */}
        <View style={styles.hiddenWorker}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccess={true}
            source={{ html: HTML_WORKER }}
            onMessage={handleWorkerMessage}
            onLoadEnd={() => setWorkerReady(true)}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#07090E',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#14B8A6',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewportContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#0D9488',
    elevation: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.22,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
  },
  gridCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
  },
  corner: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: '#2DD4BF',
  },
  cornerTL: {
    top: 6,
    left: 6,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 6,
    right: 6,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 6,
    left: 6,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 6,
    right: 6,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  crosshair: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.35,
  },
  crosshairH: {
    width: 16,
    height: 1.5,
    backgroundColor: '#2DD4BF',
  },
  crosshairV: {
    width: 1.5,
    height: 16,
    backgroundColor: '#2DD4BF',
    position: 'absolute',
  },
  hintBadge: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hintBadgeText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
  },
  controlsBar: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBadge: {
    minWidth: 42,
    alignItems: 'center',
  },
  zoomText: {
    color: '#2DD4BF',
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 6,
  },
  resetBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  retakeBtnText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  hiddenWorker: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },
});
