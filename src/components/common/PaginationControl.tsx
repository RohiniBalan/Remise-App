import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

interface PaginationControlProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControl({
  currentPage,
  totalItems,
  itemsPerPage = 30,
  onPageChange,
}: PaginationControlProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (totalItems <= itemsPerPage) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>
        Showing <Text style={styles.bold}>{startItem}–{endItem}</Text> of <Text style={styles.bold}>{totalItems}</Text>
      </Text>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.navBtn, currentPage === 1 && styles.navBtnDisabled]}
          onPress={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          activeOpacity={0.7}
        >
          <ChevronLeft size={16} color={currentPage === 1 ? '#9CA3AF' : CustomerColors.teal700} />
          <Text style={[styles.navBtnText, currentPage === 1 && styles.navBtnTextDisabled]}>Prev</Text>
        </TouchableOpacity>

        <View style={styles.pagePill}>
          <Text style={styles.pagePillText}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.navBtn, currentPage === totalPages && styles.navBtnDisabled]}
          onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          activeOpacity={0.7}
        >
          <Text style={[styles.navBtnText, currentPage === totalPages && styles.navBtnTextDisabled]}>Next</Text>
          <ChevronRight size={16} color={currentPage === totalPages ? '#9CA3AF' : CustomerColors.teal700} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoText: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginBottom: 2,
  },
  bold: {
    fontWeight: '700',
    color: CustomerColors.black,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  navBtnDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  navBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  navBtnTextDisabled: {
    color: '#9CA3AF',
  },
  pagePill: {
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  pagePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
});
