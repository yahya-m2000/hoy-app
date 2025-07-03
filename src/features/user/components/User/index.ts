// Remove Avatar and AvatarProps exports to avoid conflict with base Avatar
// export { default as Avatar } from "./Avatar";
// export type * from "./User.types";

// Export specific types if needed, excluding AvatarProps
export type { AvatarSize, AvatarStatus } from "./User.types";
