// Shared services exports - organized by layer
export * from "./api";
export * from "./core";
export * from "./external";

// Note: Domain-specific services moved to api folder to avoid conflicts
// hostService and propertyService are duplicates of api exports
