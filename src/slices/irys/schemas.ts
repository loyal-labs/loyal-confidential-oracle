export const IrysOnepassItemFields = {
  PRIVATE_KEY: "credential",
} as const;

export type IrysOnepassItemField =
  (typeof IrysOnepassItemFields)[keyof typeof IrysOnepassItemFields];
