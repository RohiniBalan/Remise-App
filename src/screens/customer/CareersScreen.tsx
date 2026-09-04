import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Linking,
} from 'react-native';
import {
  Rocket,
  Lightbulb,
  BookOpen,
  Handshake,
  Users,
  GraduationCap,
  PenTool,
  TrendingUp,
  Puzzle,
  Target,
  Hammer,
  Search,
  FileText,
  MessageSquare,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  Mail,
  Laptop,
  Palmtree,
  HeartPulse,
  IndianRupee,
} from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

const BRAND_RED = CustomerColors.primary;

const WHY_JOIN = [
  {
    icon: Rocket,
    title: 'Make an Impact',
    desc: 'Work on features used by real customers and businesses daily.',
  },
  {
    icon: Lightbulb,
    title: 'Build & Innovate',
    desc: 'Turn bold ideas into practical, high-scale local commerce solutions.',
  },
  {
    icon: BookOpen,
    title: 'Keep Learning',
    desc: 'Develop your craft alongside passionate peers on real projects.',
  },
  {
    icon: Handshake,
    title: 'Grow Together',
    desc: 'Collaborate in a supportive culture focused on long-term growth.',
  },
];

const LIFE_AT_REMISE = [
  {
    icon: Users,
    title: 'Collaborate',
    desc: 'Work together, share ideas, and learn from one another across disciplines.',
  },
  {
    icon: GraduationCap,
    title: 'Learn',
    desc: 'Take on new challenges and continuously develop your technical & product skills.',
  },
  {
    icon: PenTool,
    title: 'Create',
    desc: 'Turn ideas into features and experiences that solve everyday problems.',
  },
  {
    icon: TrendingUp,
    title: 'Grow',
    desc: 'Take ownership of your work and grow along with the company.',
  },
];

const WHAT_WE_LOOK_FOR = [
  {
    icon: Lightbulb,
    title: 'Curious',
    desc: 'People who enjoy learning and exploring new concepts and technologies.',
  },
  {
    icon: Puzzle,
    title: 'Problem Solvers',
    desc: 'Engineers & designers who approach challenges thoughtfully.',
  },
  {
    icon: Handshake,
    title: 'Team Players',
    desc: 'Great products are built through open collaboration and respect.',
  },
  {
    icon: Target,
    title: 'Ownership',
    desc: 'Take pride and responsibility for your work from concept to delivery.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Mindset',
    desc: 'Willingness to learn, adapt, iterate, and continuously improve.',
  },
  {
    icon: Hammer,
    title: 'Builders',
    desc: 'People who turn abstract ideas into real, practical solutions.',
  },
];

const HIRING_STEPS = [
  {
    icon: FileText,
    title: 'Apply',
    desc: 'Submit your profile or resume for a position matching your skills.',
  },
  {
    icon: Search,
    title: 'Application Review',
    desc: 'Our engineering & product team reviews your background and projects.',
  },
  {
    icon: MessageSquare,
    title: 'Interview',
    desc: 'Discuss your experience, problem-solving skills, and role expectations.',
  },
  {
    icon: CheckCircle2,
    title: 'Decision',
    desc: "We'll get back to you promptly with constructive feedback and next steps.",
  },
];

const BENEFITS = [
  { icon: Laptop, label: 'Flexible Work' },
  { icon: BookOpen, label: 'Learning & Growth' },
  { icon: Palmtree, label: 'Paid Time Off' },
  { icon: HeartPulse, label: 'Health Support' },
  { icon: IndianRupee, label: 'Competitive Pay' },
  { icon: Rocket, label: 'Career Growth' },
];

export default function CareersScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Rocket size={13} color={BRAND_RED} />
          <Text style={styles.badgeText}>Careers at Remise</Text>
        </View>
        <Text style={styles.heroTitle}>Build the future of local commerce with us</Text>
        <Text style={styles.heroSubtitle}>
          We're creating smart, accessible tools connecting local buyers and sellers across India.
          Join our team to solve real problems and build software that matters.
        </Text>
      </View>

      {/* WHY JOIN */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>Why Join Remise?</Text>
        </View>
        <View style={styles.gridTwo}>
          {WHY_JOIN.map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={i} style={styles.whyCard}>
                <View style={styles.iconCircle}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* LIFE AT REMISE */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>Life at Remise</Text>
        </View>
        <View style={styles.gridTwo}>
          {LIFE_AT_REMISE.map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={i} style={styles.whyCard}>
                <View style={styles.iconCircle}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* WHAT WE LOOK FOR */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>What We Value</Text>
        </View>
        <View style={styles.gridTwo}>
          {WHAT_WE_LOOK_FOR.map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={i} style={styles.whyCard}>
                <View style={styles.iconCircle}>
                  <Icon size={18} color={BRAND_RED} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* OPEN POSITIONS / APPLICATION */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>Open Positions</Text>
        </View>

        <View style={styles.emptyJobsCard}>
          <View style={styles.emptyIconCircle}>
            <Briefcase size={28} color={BRAND_RED} />
          </View>
          <Text style={styles.emptyJobsTitle}>No Open Positions Right Now</Text>
          <Text style={styles.emptyJobsSubtitle}>
            We're not actively recruiting for specific roles at this moment, but we're always eager
            to meet talented engineers, designers, and growth builders.
          </Text>
          <TouchableOpacity
            style={styles.openApplyBtn}
            onPress={() => Linking.openURL('mailto:porulontechnologies@gmail.com?subject=Open%20Application%20at%20Remise')}
            activeOpacity={0.85}
          >
            <Mail size={16} color="#FFFFFF" />
            <Text style={styles.openApplyBtnText}>Send General Application</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* HOW WE HIRE */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>Our Hiring Process</Text>
        </View>
        <View style={{ gap: Spacing.sm }}>
          {HIRING_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <View key={i} style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Icon size={14} color={BRAND_RED} />
                    <Text style={styles.stepTitle}>{step.title}</Text>
                  </View>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* BENEFITS & PERKS */}
      <View style={styles.section}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.headingBar} />
          <Text style={styles.sectionHeadingText}>Benefits & Perks</Text>
        </View>
        <View style={styles.benefitsGrid}>
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <View key={i} style={styles.benefitChip}>
                <Icon size={14} color={BRAND_RED} />
                <Text style={styles.benefitText}>{b.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* CONTACT CTA */}
      <View style={styles.ctaCard}>
        <Mail size={24} color={BRAND_RED} style={{ marginBottom: Spacing.xs }} />
        <Text style={styles.ctaTitle}>Questions about working with us?</Text>
        <Text style={styles.ctaSubtitle}>
          Get in touch with our team directly. We'd love to hear from you.
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => Linking.openURL('mailto:porulontechnologies@gmail.com?subject=Careers%20Inquiry%20-%20Remise')}
          activeOpacity={0.85}
        >
          <Mail size={16} color="#FFFFFF" />
          <Text style={styles.ctaButtonText}>Contact Careers Team</Text>
          <ArrowRight size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  hero: { padding: Spacing.lg, paddingTop: Spacing.xl },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.35)',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND_RED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: FontSizes.xl ?? 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  heroSubtitle: { fontSize: FontSizes.sm, color: '#9CA3AF', lineHeight: 21 },

  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.xl },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  headingBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: BRAND_RED },
  sectionHeadingText: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },

  gridTwo: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'space-between' },
  whyCard: {
    width: '48%',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  cardTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFFFFF', marginTop: 2, marginBottom: 4 },
  cardDesc: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 16 },

  emptyJobsCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyJobsTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', marginBottom: Spacing.xs, textAlign: 'center' },
  emptyJobsSubtitle: { fontSize: FontSizes.xs, color: '#9CA3AF', textAlign: 'center', lineHeight: 18, marginBottom: Spacing.lg },
  openApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: BRAND_RED,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  openApplyBtnText: { fontSize: FontSizes.xs, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },

  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: BRAND_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  stepTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFFFFF' },
  stepDesc: { fontSize: FontSizes.xs, color: '#9CA3AF', lineHeight: 17 },

  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  benefitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  benefitText: { fontSize: FontSizes.xs, fontWeight: '600', color: '#D1D5DB' },

  ctaCard: {
    margin: Spacing.md,
    marginTop: Spacing.xl,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.4)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  ctaTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: Spacing.xs },
  ctaSubtitle: { fontSize: FontSizes.xs, color: '#9CA3AF', textAlign: 'center', lineHeight: 18, marginBottom: Spacing.lg },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: BRAND_RED,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  ctaButtonText: { fontSize: FontSizes.xs, fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
});
