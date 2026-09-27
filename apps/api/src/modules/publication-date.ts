export type PublicationDateDecision =
  | { action: "preserve" }
  | { action: "set"; value: Date }
  | { action: "clear" };

type PublicationDateInput = string | Date | null | undefined;

export function decidePublishedAtUpdate(input: {
  currentStatus: string;
  incomingStatus?: string | null;
  incomingPublishedAt?: PublicationDateInput;
  now?: Date;
  clearWhenUnpublished?: boolean;
}): PublicationDateDecision {
  const nextStatus = input.incomingStatus ?? input.currentStatus;
  const hasExplicitDate = input.incomingPublishedAt !== undefined
    && input.incomingPublishedAt !== null
    && input.incomingPublishedAt !== "";

  if (nextStatus === "published") {
    if (hasExplicitDate) {
      const value = input.incomingPublishedAt instanceof Date
        ? input.incomingPublishedAt
        : new Date(input.incomingPublishedAt as string);
      if (Number.isNaN(value.getTime())) throw new Error("Invalid publishedAt date");
      return { action: "set", value };
    }

    if (input.currentStatus !== "published") {
      return { action: "set", value: input.now ?? new Date() };
    }

    return { action: "preserve" };
  }

  if (input.clearWhenUnpublished && input.incomingStatus != null) {
    return { action: "clear" };
  }

  return { action: "preserve" };
}

export function publishedAtPrismaValue(decision: PublicationDateDecision): Date | null | undefined {
  if (decision.action === "set") return decision.value;
  if (decision.action === "clear") return null;
  return undefined;
}
