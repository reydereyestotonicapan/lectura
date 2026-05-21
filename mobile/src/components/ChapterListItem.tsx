import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useTheme, Radii, createShadows } from '../theme';
import { ChapterWithProgress } from '../types/chapter';

interface Props {
  chapter: ChapterWithProgress;
  onToggle: (chapterId: number) => void;
  onRead: (chapter: ChapterWithProgress) => void;
  onWatch?: (chapter: ChapterWithProgress) => void;
  isUpdating?: boolean;
}

export default function ChapterListItem({ chapter, onToggle, onRead, onWatch, isUpdating = false }: Props) {
  const { colors, isDark } = useTheme();
  const shadows = createShadows(isDark);
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 60, bounciness: 3 }).start();

  return (
    <Animated.View style={[
      styles.card, 
      { backgroundColor: colors.surface, borderColor: colors.border },
      chapter.is_read && { backgroundColor: colors.surfaceWarm, borderColor: colors.goldLight },
      shadows.sm,
      { transform: [{ scale }] }
    ]}>
      {/* Checkbox */}
      <TouchableOpacity
        style={styles.checkWrap}
        onPress={() => !isUpdating && onToggle(chapter.id)}
        disabled={isUpdating}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: chapter.is_read }}
        accessibilityLabel={`Marcar ${chapter.display_name} como ${chapter.is_read ? 'no leído' : 'leído'}`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color={colors.gold} />
        ) : chapter.is_read ? (
          <View style={[styles.checkOn, { backgroundColor: colors.gold }, shadows.xs]}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        ) : (
          <View style={[styles.checkOff, { borderColor: colors.borderMed, backgroundColor: colors.background }]} />
        )}
      </TouchableOpacity>

      {/* Chapter name */}
      <TouchableOpacity
        style={styles.nameWrap}
        onPress={() => onRead(chapter)}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
      >
        <Text 
          style={[
            styles.name, 
            { color: colors.textPrimary },
            chapter.is_read && { color: colors.textMuted }
          ]} 
          numberOfLines={1}
        >
          {chapter.display_name}
        </Text>
      </TouchableOpacity>

      {/* Action buttons */}
      <View style={styles.actions}>
        {chapter.youtube_link && onWatch ? (
          <TouchableOpacity
            style={styles.btnWatch}
            onPress={() => onWatch(chapter)}
            accessibilityLabel={`Escuchar ${chapter.display_name}`}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Text style={styles.btnWatchText}>▶</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.btnRead, { backgroundColor: colors.goldFaint, borderColor: colors.goldLight }]}
          onPress={() => onRead(chapter)}
          accessibilityLabel={`Leer ${chapter.display_name}`}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text style={[styles.btnReadText, { color: colors.primary }]}>Leer</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  checkWrap: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkOff: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  checkOn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  nameWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnWatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnWatchText: {
    fontSize: 13,
    color: '#CC3333',
    fontWeight: '700',
  },
  btnRead: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  btnReadText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
