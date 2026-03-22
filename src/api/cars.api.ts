import type { CarDto, CreateCarPayload, PaginatedResponse } from "../types/domain";
import type { PaginatedQueryParams } from "../types/pagination";
import { api } from "./client";
import { buildPaginationQueryParams } from "./paginationQuery";

export async function getCarsPage(
  query: PaginatedQueryParams
): Promise<PaginatedResponse<CarDto>> {
  const res = await api.get<PaginatedResponse<CarDto>>("/cars", {
    params: buildPaginationQueryParams(query),
  });
  return res.data;
}

export async function getCarById(id: string): Promise<CarDto> {
  const res = await api.get<CarDto>(`/cars/${encodeURIComponent(id)}`);
  return res.data;
}

export async function createCar(payload: CreateCarPayload): Promise<CarDto> {
  const res = await api.post<CarDto>("/cars", payload);
  return res.data;
}
