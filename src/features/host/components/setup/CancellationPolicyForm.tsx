import React from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Text, Input } from "@shared/components";
import { spacing } from "@core/design";
import type { CancellationPolicy } from "@core/types";

interface CancellationPolicyFormProps {
  data: Partial<CancellationPolicy>;
  errors: Record<string, string>;
  onChange: (data: Partial<CancellationPolicy>) => void;
}

export const CancellationPolicyForm: React.FC<CancellationPolicyFormProps> = ({
  data,
  errors,
  onChange,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const handleInputChange = (field: keyof CancellationPolicy, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text variant="h3" style={styles.title}>
          {t("features.host.setup.policies.cancellation.title")}
        </Text>

        <Text
          variant="body"
          color={theme.text.secondary}
          style={styles.subtitle}
        >
          {t("features.host.setup.policies.cancellation.subtitle")}
        </Text>

        <View style={styles.form}>
          {/* Refund Period Days */}
          <View style={styles.field}>
            <Text variant="label" style={styles.label}>
              {t("features.host.setup.policies.cancellation.refundPeriod")}
            </Text>
            <Text
              variant="caption"
              color={theme.text.secondary}
              style={styles.hint}
            >
              {t("features.host.setup.policies.cancellation.refundPeriodHint")}
            </Text>
            <Input
              value={data.refundPeriodDays?.toString() || ""}
              onChangeText={(value) =>
                handleInputChange("refundPeriodDays", parseInt(value) || 0)
              }
              placeholder="14"
              keyboardType="numeric"
              error={errors.refundPeriodDays}
            />
            <Text
              variant="caption"
              color={theme.text.secondary}
              style={styles.suffix}
            >
              {t("features.host.setup.policies.cancellation.days")}
            </Text>
          </View>
          {/* Full Refund Days */}
          <View style={styles.field}>
            <Text variant="label" style={styles.label}>
              {t("features.host.setup.policies.cancellation.fullRefund")}
            </Text>
            <Text
              variant="caption"
              color={theme.text.secondary}
              style={styles.hint}
            >
              {t("features.host.setup.policies.cancellation.fullRefundHint")}
            </Text>
            <Input
              value={data.fullRefundDays?.toString() || ""}
              onChangeText={(value) =>
                handleInputChange("fullRefundDays", parseInt(value) || 0)
              }
              placeholder="7"
              keyboardType="numeric"
              error={errors.fullRefundDays}
            />
            <Text
              variant="caption"
              color={theme.text.secondary}
              style={styles.suffix}
            >
              {t("features.host.setup.policies.cancellation.days")}
            </Text>
          </View>
          {/* Partial Refund Days */}
          <View style={styles.field}>
            <Text variant="label" style={styles.label}>
              {t("features.host.setup.policies.cancellation.partialRefund")}
            </Text>
            <Text
              variant="caption"
              color={theme.text.secondary}
              style={styles.hint}
            >
              {t("features.host.setup.policies.cancellation.partialRefundHint")}
            </Text>
            <Input
              value={data.partialRefundDays?.toString() || ""}
              onChangeText={(value) =>
                handleInputChange("partialRefundDays", parseInt(value) || 0)
              }
              placeholder="3"
              keyboardType="numeric"
              error={errors.partialRefundDays}
            />
            <Text
              variant="caption"
              color={theme.text.secondary}
              style={styles.suffix}
            >
              {t("features.host.setup.policies.cancellation.days")}
            </Text>
          </View>
          {/* No Refund Days */}
          <View style={styles.field}>
            <Text variant="label" style={styles.label}>
              {t("features.host.setup.policies.cancellation.noRefund")}
            </Text>
            <Text
              variant="caption"
              color={theme.text.secondary}
              style={styles.hint}
            >
              {t("features.host.setup.policies.cancellation.noRefundHint")}
            </Text>
            <Input
              value={data.noRefundDays?.toString() || ""}
              onChangeText={(value) =>
                handleInputChange("noRefundDays", parseInt(value) || 0)
              }
              placeholder="1"
              keyboardType="numeric"
              error={errors.noRefundDays}
            />
            <Text
              variant="caption"
              color={theme.text.secondary}
              style={styles.suffix}
            >
              {t("features.host.setup.policies.cancellation.days")}
            </Text>
          </View>
          {/* Policy Preview */}
          <View style={[styles.preview, { backgroundColor: theme.surface }]}>
            <Text variant="label" style={styles.previewTitle}>
              {t("features.host.setup.policies.cancellation.preview")}
            </Text>
            <Text
              variant="caption"
              color={theme.text.secondary}
              style={styles.previewSubtitle}
            >
              {t("features.host.setup.policies.cancellation.previewSubtitle")}
            </Text>

            <View style={styles.previewContent}>
              <Text variant="body" style={styles.previewText}>
                • Full refund: {data.fullRefundDays || 7}+ days before check-in
              </Text>
              <Text variant="body" style={styles.previewText}>
                • 50% refund: {data.partialRefundDays || 3}-
                {(data.fullRefundDays || 7) - 1} days before
              </Text>
              <Text variant="body" style={styles.previewText}>
                • No refund: Less than {data.noRefundDays || 1} day before
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    marginBottom: spacing.xs,
  },
  hint: {
    marginBottom: spacing.sm,
  },
  suffix: {
    marginTop: spacing.xs,
    textAlign: "right",
  },
  preview: {
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  previewTitle: {
    marginBottom: spacing.xs,
  },
  previewSubtitle: {
    marginBottom: spacing.sm,
  },
  previewContent: {
    gap: spacing.xs,
  },
  previewText: {
    lineHeight: 20,
  },
});
