import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";

export const STALE_VERSION_CODE = "STALE_VERSION";

export function omitUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)) as Partial<T>;
}

export async function updateWithExpectedVersion<
  TCurrent extends { updatedAt: Date },
  TResult,
>(input: {
  entityName: string;
  expectedUpdatedAt?: string | null;
  findCurrent: () => Promise<TCurrent | null>;
  updateMany: (expectedUpdatedAt: Date, current: TCurrent) => Promise<{ count: number }>;
  findSaved: () => Promise<TResult | null>;
}): Promise<TResult> {
  if (!input.expectedUpdatedAt) {
    throw new BadRequestException("expectedUpdatedAt is required for updates");
  }

  const expectedUpdatedAt = new Date(input.expectedUpdatedAt);
  if (Number.isNaN(expectedUpdatedAt.getTime())) {
    throw new BadRequestException("Invalid expectedUpdatedAt date");
  }

  const current = await input.findCurrent();
  if (!current) throw new NotFoundException(`${input.entityName} not found`);

  if (current.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
    throw staleVersionConflict(input.entityName);
  }

  const result = await input.updateMany(expectedUpdatedAt, current);
  if (result.count !== 1) throw staleVersionConflict(input.entityName);

  const saved = await input.findSaved();
  if (!saved) throw new NotFoundException(`${input.entityName} not found after update`);
  return saved;
}

function staleVersionConflict(entityName: string) {
  return new ConflictException({
    code: STALE_VERSION_CODE,
    message: `${entityName} changed after it was loaded. Reload the latest version before saving again.`,
  });
}
