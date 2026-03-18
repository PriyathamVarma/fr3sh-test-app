import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Dimensions, Animated, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1', emoji: '🥦',
    title: 'Freshness\nGuaranteed',
    subtitle: 'Farm-to-door produce, handpicked daily. No middlemen — just pure freshness straight to your table.',
    bg: '#FFF5EC', accent: Colors.primary, emojiBg: '#FFE4CC',
  },
  {
    id: '2', emoji: '⚡',
    title: 'Delivered in\n10 Minutes',
    subtitle: 'Our dark stores are minutes away. Order now and watch your groceries arrive before your coffee brews.',
    bg: '#FFFBEC', accent: '#F59E0B', emojiBg: '#FEF3C7',
  },
  {
    id: '3', emoji: '💚',
    title: 'Eat Better,\nLive Better',
    subtitle: 'Curated healthy options, organic produce, and transparent sourcing — because you deserve the best.',
    bg: '#F0FFF4', accent: '#22C55E', emojiBg: '#DCFCE7',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.bg }]}>
            <View style={[styles.illustrationContainer, { backgroundColor: item.emojiBg }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={[styles.accentRing, { borderColor: item.accent + '33' }]} />
              <View style={[styles.accentRingOuter, { borderColor: item.accent + '15' }]} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, i) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [8, 28, 8],
            extrapolate: 'clamp',
          });
          const dotOpacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { width: dotWidth, opacity: dotOpacity, backgroundColor: SLIDES[activeIndex]?.accent || Colors.primary },
              ]}
            />
          );
        })}
      </View>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: SLIDES[activeIndex]?.accent || Colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>
            {activeIndex === SLIDES.length - 1 ? 'Get Started 🚀' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  skipBtn: {
    position: 'absolute', top: 52, right: 24, zIndex: 10,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: BorderRadius.full,
  },
  skipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray600 },
  slide: {
    width, flex: 1,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, paddingTop: 80, paddingBottom: 160,
  },
  illustrationContainer: {
    width: 220, height: 220, borderRadius: 110,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 48, position: 'relative',
  },
  emoji: { fontSize: 90 },
  accentRing: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 2,
  },
  accentRingOuter: {
    position: 'absolute', width: 270, height: 270, borderRadius: 135, borderWidth: 2,
  },
  title: {
    fontSize: 36, fontWeight: '900', color: Colors.gray900,
    textAlign: 'center', lineHeight: 44, marginBottom: 16, letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.md, color: Colors.gray500,
    textAlign: 'center', lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, position: 'absolute', bottom: 140, alignSelf: 'center',
  },
  dot: { height: 8, borderRadius: 4 },
  ctaContainer: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  ctaBtn: {
    paddingVertical: 18, borderRadius: BorderRadius.xl, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  ctaBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800', letterSpacing: 0.2 },
});
