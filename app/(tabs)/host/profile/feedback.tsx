/**
 * Feedback Page Component
 *
 * Comprehensive feedback page for collecting user feedback including:
 * - Bug reports, feature requests, improvements, general feedback, and complaints
 * - Categorized feedback with proper validation
 * - Anonymous feedback option
 * - Multi-step form with proper validation
 *
 * @module @app/(tabs)/traveler/profile/feedback
 */

import React, { useState, useEffect } from "react";
import { Platform, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Core components and design
import {
  Container,
  Text,
  Button,
  Input,
  Icon,
  LoadingSkeleton,
  Screen,
} from "@shared/components";
import { useTheme } from "@core/hooks";
import { iconSize, spacing } from "@core/design";

// Types and constants
import {
  FeedbackType,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackFormData,
  FeedbackFormErrors,
  FEEDBACK_TYPES,
  FEEDBACK_CATEGORIES,
  FEEDBACK_PRIORITIES,
} from "@core/types/feedback.types";

// Hooks
import { useCreateFeedback } from "@features/account/hooks/useCreateFeedback";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";

interface FeedbackOptionCardProps {
  option: {
    value: string;
    label: string;
    description: string;
    icon: string;
    color?: string;
  };
  selected: boolean;
  onSelect: () => void;
}

const FeedbackOptionCard: React.FC<FeedbackOptionCardProps> = ({
  option,
  selected,
  onSelect,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.7}>
      <Container
        borderRadius="lg"
        paddingHorizontal="md"
        paddingVertical="sm"
        backgroundColor={selected ? theme.surface : "transparent"}
        marginBottom="md"
        flexDirection="row"
        alignItems="center"
      >
        <Container
          width={40}
          height={40}
          borderRadius="circle"
          justifyContent="center"
          alignItems="center"
        >
          <Icon
            name={option.icon as any}
            size={iconSize.md}
            color={theme.text?.primary}
          />
        </Container>

        <Container flex={1}>
          <Text variant="h6" weight="semibold">
            {option.label}
          </Text>
          <Text variant="body2" color="secondary">
            {option.description}
          </Text>
        </Container>

        {selected && (
          <Container
            width={24}
            height={24}
            justifyContent="center"
            alignItems="center"
          >
            <Icon name="checkmark" size={iconSize.sm} />
          </Container>
        )}
      </Container>
    </TouchableOpacity>
  );
};

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { createFeedback, isLoading, error, isSuccess, reset } =
    useCreateFeedback();

  // Form state
  const [currentStep, setCurrentStep] = useState<
    "type" | "category" | "form" | "review"
  >("type");
  const [formData, setFormData] = useState<Partial<FeedbackFormData>>({
    type: undefined,
    category: undefined,
    priority: "medium",
    subject: "",
    description: "",
    steps: "",
    expectedBehavior: "",
    actualBehavior: "",
    isAnonymous: false,
    email: "",
    tags: [],
  });
  const [errors, setErrors] = useState<FeedbackFormErrors>({});

  // Reset form when component mounts
  useEffect(() => {
    setCurrentStep("type");
    setFormData({
      type: undefined,
      category: undefined,
      priority: "medium",
      subject: "",
      description: "",
      steps: "",
      expectedBehavior: "",
      actualBehavior: "",
      isAnonymous: false,
      email: "",
      tags: [],
    });
    setErrors({});
    reset();
  }, [reset]);

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      Alert.alert(t("feedback.success.title"), t("feedback.success.message"), [
        {
          text: t("common.ok"),
          onPress: () => {
            router.back();
          },
        },
      ]);
    }
  }, [isSuccess, t, router]);

  // Validation
  const validateStep = (step: string): boolean => {
    const newErrors: FeedbackFormErrors = {};

    switch (step) {
      case "type":
        if (!formData.type) {
          newErrors.type = t("feedback.errors.typeRequired");
        }
        break;
      case "category":
        if (!formData.category) {
          newErrors.category = t("feedback.errors.categoryRequired");
        }
        break;
      case "form":
        if (!formData.subject?.trim()) {
          newErrors.subject = t("feedback.errors.subjectRequired");
        } else if (formData.subject.length < 5) {
          newErrors.subject = t("feedback.errors.subjectTooShort");
        }
        if (!formData.description?.trim()) {
          newErrors.description = t("feedback.errors.descriptionRequired");
        } else if (formData.description.length < 10) {
          newErrors.description = t("feedback.errors.descriptionTooShort");
        }
        if (formData.isAnonymous && !formData.email?.trim()) {
          newErrors.email = t("feedback.errors.emailRequiredForAnonymous");
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    switch (currentStep) {
      case "type":
        setCurrentStep("category");
        break;
      case "category":
        setCurrentStep("form");
        break;
      case "form":
        setCurrentStep("review");
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "category":
        setCurrentStep("type");
        break;
      case "form":
        setCurrentStep("category");
        break;
      case "review":
        setCurrentStep("form");
        break;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep("form")) return;

    try {
      const deviceInfo = {
        platform: Platform.OS as "ios" | "android",
        version: "1.0.0", // You might want to get this from app config
      };

      await createFeedback({
        type: formData.type!,
        category: formData.category!,
        priority: formData.priority!,
        subject: formData.subject!,
        description: formData.description!,
        steps: formData.steps || undefined,
        expectedBehavior: formData.expectedBehavior || undefined,
        actualBehavior: formData.actualBehavior || undefined,
        deviceInfo,
        isAnonymous: formData.isAnonymous,
        email: formData.isAnonymous ? formData.email : undefined,
        tags: formData.tags || [],
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const renderTypeSelection = () => (
    <Container>
      <Text variant="h5" weight="semibold" marginBottom="md">
        {t("feedback.selectType")}
      </Text>
      <Text variant="body2" color="secondary" marginBottom="lg">
        {t("feedback.selectTypeDescription")}
      </Text>
      {FEEDBACK_TYPES.map((type) => (
        <FeedbackOptionCard
          key={type.value}
          option={type}
          selected={formData.type === type.value}
          onSelect={() => setFormData({ ...formData, type: type.value })}
        />
      ))}
      {errors.type && (
        <Text variant="body2" color="error" weight="bold" marginTop="sm">
          {errors.type}
        </Text>
      )}
    </Container>
  );

  const renderCategorySelection = () => (
    <Container>
      <Text variant="h5" weight="semibold" marginBottom="md">
        {t("feedback.selectCategory")}
      </Text>
      <Text variant="body2" color="secondary" marginBottom="lg">
        {t("feedback.selectCategoryDescription")}
      </Text>
      {FEEDBACK_CATEGORIES.map((category) => (
        <FeedbackOptionCard
          key={category.value}
          option={category}
          selected={formData.category === category.value}
          onSelect={() =>
            setFormData({ ...formData, category: category.value })
          }
        />
      ))}
      {errors.category && (
        <Text variant="body2" color="error" weight="bold" marginTop="sm">
          {errors.category}
        </Text>
      )}
    </Container>
  );

  const renderForm = () => (
    <Container>
      <Text variant="h5" weight="semibold" marginBottom="md">
        {t("feedback.details")}
      </Text>

      {/* Anonymous feedback toggle */}
      <Container
        flexDirection="row"
        alignItems="center"
        padding="md"
        marginBottom="lg"
        borderRadius="md"
        backgroundColor="background"
      >
        <Container flex={1}>
          <Text variant="body" weight="semibold">
            {t("feedback.submitAnonymously")}
          </Text>
          <Text variant="body2" color="secondary">
            {t("feedback.submitAnonymouslyDescription")}
          </Text>
        </Container>
        <Button
          title={formData.isAnonymous ? t("common.on") : t("common.off")}
          variant={formData.isAnonymous ? "primary" : "outline"}
          size="small"
          onPress={() =>
            setFormData({ ...formData, isAnonymous: !formData.isAnonymous })
          }
        />
      </Container>

      {/* Email field for anonymous feedback */}
      {formData.isAnonymous && (
        <Container marginBottom="md">
          <Input
            label={t("feedback.email")}
            placeholder={t("feedback.emailPlaceholder")}
            value={formData.email}
            onChangeText={(email) => setFormData({ ...formData, email })}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon="mail-outline"
          />
          {errors.email && (
            <Text variant="body2" color="error" weight="bold" marginTop="sm">
              {errors.email}
            </Text>
          )}
        </Container>
      )}

      {/* Subject */}
      <Container marginBottom="md">
        <Input
          label={t("feedback.subject")}
          placeholder={t("feedback.subjectPlaceholder")}
          value={formData.subject}
          onChangeText={(subject) => setFormData({ ...formData, subject })}
          error={errors.subject}
          maxLength={200}
        />
        {errors.subject && (
          <Text variant="body2" color="error" weight="bold" marginTop="sm">
            {errors.subject}
          </Text>
        )}
      </Container>

      {/* Description */}
      <Container marginBottom="md">
        <Input
          label={t("feedback.description")}
          placeholder={t("feedback.descriptionPlaceholder")}
          value={formData.description}
          onChangeText={(description) =>
            setFormData({ ...formData, description })
          }
          multiline
          numberOfLines={4}
          error={errors.description}
          maxLength={5000}
        />
        {errors.description && (
          <Text variant="body2" color="error" weight="bold" marginTop="sm">
            {errors.description}
          </Text>
        )}
      </Container>

      {/* Bug-specific fields */}
      {formData.type === "bug_report" && (
        <>
          <Container marginBottom="md">
            <Input
              label={t("feedback.stepsToReproduce")}
              placeholder={t("feedback.stepsToReproducePlaceholder")}
              value={formData.steps}
              onChangeText={(steps) => setFormData({ ...formData, steps })}
              multiline
              numberOfLines={3}
              maxLength={2000}
            />
          </Container>
          <Container marginBottom="md">
            <Input
              label={t("feedback.expectedBehavior")}
              placeholder={t("feedback.expectedBehaviorPlaceholder")}
              value={formData.expectedBehavior}
              onChangeText={(expectedBehavior) =>
                setFormData({ ...formData, expectedBehavior })
              }
              multiline
              numberOfLines={2}
              maxLength={1000}
            />
          </Container>
          <Container marginBottom="md">
            <Input
              label={t("feedback.actualBehavior")}
              placeholder={t("feedback.actualBehaviorPlaceholder")}
              value={formData.actualBehavior}
              onChangeText={(actualBehavior) =>
                setFormData({ ...formData, actualBehavior })
              }
              multiline
              numberOfLines={2}
              maxLength={1000}
            />
          </Container>
        </>
      )}

      {/* Priority */}
      <Container marginBottom="md">
        <Text variant="body" weight="semibold" marginBottom="sm">
          {t("feedback.priority")}
        </Text>
        <Container flexDirection="row" flexWrap="wrap">
          {FEEDBACK_PRIORITIES.map((priority) => (
            <Button
              key={priority.value}
              title={priority.label}
              variant={
                formData.priority === priority.value ? "primary" : "outline"
              }
              size="small"
              onPress={() =>
                setFormData({ ...formData, priority: priority.value })
              }
              style={{ marginRight: spacing.sm, marginBottom: spacing.sm }}
            />
          ))}
        </Container>
      </Container>
    </Container>
  );

  const renderReview = () => {
    const selectedType = FEEDBACK_TYPES.find((t) => t.value === formData.type);
    const selectedCategory = FEEDBACK_CATEGORIES.find(
      (c) => c.value === formData.category
    );
    const selectedPriority = FEEDBACK_PRIORITIES.find(
      (p) => p.value === formData.priority
    );

    return (
      <Container>
        <Text variant="h5" weight="semibold" marginBottom="md">
          {t("feedback.review")}
        </Text>
        <Text variant="body2" color="secondary" marginBottom="lg">
          {t("feedback.reviewDescription")}
        </Text>

        <Container
          padding="md"
          marginBottom="lg"
          borderRadius="md"
          backgroundColor="background"
        >
          <Text variant="body" weight="semibold" marginBottom="sm">
            {t("feedback.type")}: {selectedType?.label}
          </Text>
          <Text variant="body" weight="semibold" marginBottom="sm">
            {t("feedback.category")}: {selectedCategory?.label}
          </Text>
          <Text variant="body" weight="semibold" marginBottom="sm">
            {t("feedback.priority")}: {selectedPriority?.label}
          </Text>
          <Text variant="body" weight="semibold" marginBottom="sm">
            {t("feedback.subject")}: {formData.subject}
          </Text>
          <Text variant="body" weight="semibold" marginBottom="sm">
            {t("feedback.anonymous")}:{" "}
            {formData.isAnonymous ? t("common.yes") : t("common.no")}
          </Text>
        </Container>

        <Container
          padding="md"
          marginBottom="lg"
          borderRadius="md"
          backgroundColor="backgroundSecondary"
        >
          <Text variant="body" weight="semibold" marginBottom="sm">
            {t("feedback.description")}:
          </Text>
          <Text variant="body2">{formData.description}</Text>
        </Container>

        {error && (
          <Container
            padding="md"
            marginBottom="lg"
            borderRadius="md"
            backgroundColor="errorLight"
          >
            <Text variant="body2" color="error">
              {error}
            </Text>
          </Container>
        )}
      </Container>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "type":
        return renderTypeSelection();
      case "category":
        return renderCategorySelection();
      case "form":
        return renderForm();
      case "review":
        return renderReview();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "type":
        return t("feedback.selectType");
      case "category":
        return t("feedback.selectCategory");
      case "form":
        return t("feedback.details");
      case "review":
        return t("feedback.review");
      default:
        return t("feedback.title");
    }
  };

  return (
    <Screen
      header={{
        title: t("feedback.title"),
        left: {
          icon: "chevron-back-outline",
          onPress: () => router.back(),
        },
        showDivider: false,
      }}
    >
      {/* Content */}
      <Container flex={1} paddingHorizontal="lg">
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingVertical: spacing.lg }}
          bottomOffset={100}
        >
          {renderStepContent()}
        </KeyboardAwareScrollView>

        {/* Navigation buttons */}
        <Container
          flexDirection="row"
          paddingVertical="lg"
          style={{ paddingBottom: insets.bottom }}
        >
          {currentStep !== "type" && (
            <Container flex={1} marginRight="md">
              <Button
                title={t("common.back")}
                variant="outline"
                onPress={handleBack}
                disabled={isLoading}
              />
            </Container>
          )}

          <Container flex={1}>
            <Button
              title={
                currentStep === "review"
                  ? t("feedback.submit")
                  : t("common.next")
              }
              variant="primary"
              onPress={currentStep === "review" ? handleSubmit : handleNext}
              loading={isLoading}
            />
          </Container>
        </Container>
      </Container>
      <KeyboardToolbar />
    </Screen>
  );
}
