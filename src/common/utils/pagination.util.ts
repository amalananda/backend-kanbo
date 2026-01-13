// src/common/utils/pagination.util.ts
import { PaginationDto } from '../dto/pagination.dto'
import { PaginatedResult, PaginationMeta } from '../interfaces/pagination.interface'

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

export function createPaginatedResult<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResult<T> {
  return {
    data,
    meta: createPaginationMeta(page, limit, total),
  }
}

export function getPaginationParams(paginationDto: PaginationDto) {
  const page = paginationDto.page || 1
  const limit = paginationDto.limit || 10
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
