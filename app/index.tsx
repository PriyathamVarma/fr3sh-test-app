import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(20)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(taglineTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }, 400);

    setTimeout(() => {
      const pulse = (dot: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.3, duration: 350, useNativeDriver: true }),
          ])
        ).start();
      };
      pulse(dot1, 0);
      pulse(dot2, 200);
      pulse(dot3, 400);
    }, 800);

    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <Animated.View
        style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>Fr3sh</Text>
          <Text style={styles.logoSub}>grocery</Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.taglineContainer,
          { opacity: taglineOpacity, transform: [{ translateY: taglineTranslate }] },
        ]}
      >
        <Text style={styles.tagline}>Fresh. Fast. Delivered.</Text>
      </Animated.View>

      <View style={styles.dotsRow}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobTopRight: {
    position: 'absolute', top: -80, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  blobBottomLeft: {
    position: 'absolute', bottom: -100, left: -60,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  logoContainer: { alignItems: 'center', marginBottom: 16 },
  logoBox: {
    width: 130, height: 130, borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25, shadowRadius: 32, elevation: 20,
  },
  logoText: { fontSize: 32, fontWeight: '900', color: Colors.primary, letterSpacing: -1 },
  logoSub: { fontSize: 11, fontWeight: '600', color: Colors.gray400, letterSpacing: 3, marginTop: -2 },
  taglineContainer: { marginBottom: 60 },
  tagline: { fontSize: 17, color: 'rgba(255,255,255,0.88)', fontWeight: '500', letterSpacing: 1.5 },
  dotsRow: {
    flexDirection: 'row', gap: 8,
    position: 'absolute', bottom: 80,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white },
});
