import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme';
import { ChapterWithProgress } from '../types/chapter';

interface ChapterListItemProps {
  chapter: ChapterWithProgress;
  onToggle: (chapterId: number) => void;
  onRead: (chapter: ChapterWithProgress) => void;
  isUpdating?: boolean;
}

export default function ChapterListItem({
  chapter,
  onToggle,
  onRead,
  isUpdating = false,
}: ChapterListItemProps) {
  const handleToggle = () => {
    if (!isUpdating) {
      onToggle(chapter.id);
    }
  };

  const handleRead = () => {
    onRead(chapter);
  };

  return (
    <View style={styles.container}>
      {/* Checkbox on the left */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={handleToggle}
        disabled={isUpdating}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: chapter.is_read }}
        accessibilityLabel={`Marcar ${chapter.display_name} como ${chapter.is_read ? 'no leído' : 'leído'}`}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : chapter.is_read ? (
          <View style={styles.checkboxChecked}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        ) : (
          <View style={styles.checkboxUnchecked} />
        )}
      </TouchableOpacity>

      {/* Chapter name in the middle */}
      <View style={styles.chapterInfo}>
        <Text style={[styles.chapterName, chapter.is_read && styles.chapterNameRead]}>
          {chapter.display_name}
        </Text>
      </View>

      {/* "Leer" button on the right */}
      <TouchableOpacity
        style={styles.readButton}
        onPress={handleRead}
        accessibilityRole="button"
        accessibilityLabel={`Leer ${chapter.display_name}`}
      >
        <Text style={styles.readButtonText}>Leer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  checkboxContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chapterInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  chapterName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  chapterNameRead: {
    color: Colors.textMuted,
  },
  readButton: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  readButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
