import React, { ReactNode } from "react";
import { useTheme } from "@shared/hooks/useTheme";
import { Text, Icon, Container } from "@shared/components/base";
import { spacing, iconSize } from "@shared/constants";

export interface PolicyItemProps {
  icon: string;
  title: string;
  value: string;
  description?: string;
  positive?: boolean;
}

export const PolicyItem: React.FC<PolicyItemProps> = ({
  icon,
  title,
  value,
  description,
  positive = true,
}) => {
  const { theme } = useTheme();

  return (
    <Container
      flexDirection="row"
      alignItems="flex-start"
      marginBottom="md"
      paddingVertical="sm"
    >
      <Icon name={icon as any} size={iconSize.md} color={theme.text.primary} />
      <Container marginLeft="md" flex={1}>
        <Text variant="body" weight="medium">
          {title}
        </Text>
        <Text
          variant="body"
          color={theme.text.secondary}
          style={{ marginTop: spacing.xs }}
        >
          {value}
        </Text>
        {description && (
          <Text variant="caption" color={theme.text.secondary}>
            {description}
          </Text>
        )}
      </Container>
    </Container>
  );
};

export interface SafetyItemProps {
  available: boolean;
  title: string;
  description?: string;
}

export const SafetyItem: React.FC<SafetyItemProps> = ({
  available,
  title,
  description,
}) => {
  const { theme } = useTheme();

  return (
    <Container
      flexDirection="row"
      alignItems="flex-start"
      marginBottom="md"
      paddingVertical="sm"
    >
      <Icon
        name={available ? "checkmark-circle-outline" : "close-circle-outline"}
        size={iconSize.md}
        color={theme.text.primary}
      />
      <Container marginLeft="md" flex={1}>
        <Text variant="body" weight="medium">
          {title}
        </Text>
        {description && (
          <Text variant="caption" color={theme.text.secondary}>
            {description}
          </Text>
        )}
      </Container>
    </Container>
  );
};

export interface InfoItemProps {
  icon: string;
  iconColor?: string;
  children: ReactNode;
  backgroundColor?: string;
}

export const InfoItem: React.FC<InfoItemProps> = ({
  icon,
  iconColor,
  children,
  backgroundColor,
}) => {
  const { theme } = useTheme();

  return (
    <Container
      flexDirection="row"
      alignItems="flex-start"
      marginBottom="sm"
      paddingVertical="sm"
      backgroundColor={backgroundColor}
    >
      <Icon name={icon as any} size={iconSize.sm} color={theme.text.primary} />
      <Container marginLeft="md" flex={1}>
        {children}
      </Container>
    </Container>
  );
};

export interface PolicySectionProps {
  title: string;
  children: ReactNode;
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  title,
  children,
}) => {
  return (
    <Container marginBottom="lg">
      <Text variant="h6" weight="semibold" style={{ marginBottom: spacing.md }}>
        {title}
      </Text>
      {children}
    </Container>
  );
};

export interface InfoBoxProps {
  icon?: string;
  iconColor?: string;
  backgroundColor?: string;
  children: ReactNode;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  icon = "information-circle-outline",
  iconColor,
  backgroundColor = "rgba(59, 130, 246, 0.1)",
  children,
}) => {
  const { theme } = useTheme();

  return (
    <Container
      flexDirection="row"
      alignItems="flex-start"
      marginTop="sm"
      paddingHorizontal="md"
      paddingVertical="sm"
      backgroundColor={backgroundColor}
      borderRadius="sm"
    >
      <Icon
        name={icon as any}
        size={iconSize.sm}
        color={iconColor || theme.colors.primary}
      />
      <Container marginLeft="sm" flex={1}>
        {children}
      </Container>
    </Container>
  );
};

export interface BulletListItemProps {
  icon?: string;
  iconColor?: string;
  children: ReactNode;
}

export const BulletListItem: React.FC<BulletListItemProps> = ({
  icon = "information-circle-outline",
  iconColor,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <Container flexDirection="row" alignItems="center" marginBottom="md">
      <Icon name={icon as any} size={iconSize.md} color={theme.text.primary} />
      <Container flex={1} marginLeft="xs">
        {children}
      </Container>
    </Container>
  );
};

export interface BulletListProps {
  items: string[];
  icon?: string;
  iconColor?: string;
}

export const BulletList: React.FC<BulletListProps> = ({
  items,
  icon,
  iconColor,
}) => {
  return (
    <Container>
      {items.map((item, index) => (
        <BulletListItem key={index} icon={icon} iconColor={iconColor}>
          <Text variant="body">{item}</Text>
        </BulletListItem>
      ))}
    </Container>
  );
};

export interface RefundScheduleItemProps {
  percentage: number;
  beforeDays: number;
}

export const RefundScheduleItem: React.FC<RefundScheduleItemProps> = ({
  percentage,
  beforeDays,
}) => {
  const { theme } = useTheme();

  return (
    <Container flexDirection="row" alignItems="flex-start" marginBottom="md">
      <Container
        width={8}
        height={8}
        borderRadius="circle"
        backgroundColor="#10B981"
        style={{ marginTop: 6, marginRight: 16 }}
      />
      <Container flex={1}>
        <Text variant="body">{percentage}% refund</Text>
        <Text variant="caption" color={theme.text.secondary}>
          {beforeDays > 0
            ? `Cancel ${beforeDays} days before check-in`
            : "After check-in"}
        </Text>
      </Container>
    </Container>
  );
};

export interface RefundScheduleProps {
  refunds: {
    percentage: number;
    beforeDays: number;
  }[];
}

export const RefundSchedule: React.FC<RefundScheduleProps> = ({ refunds }) => {
  return (
    <Container>
      {refunds.map((refund, index) => (
        <RefundScheduleItem
          key={index}
          percentage={refund.percentage}
          beforeDays={refund.beforeDays}
        />
      ))}
    </Container>
  );
};
