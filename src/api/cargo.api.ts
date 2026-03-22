import type { CargoDto, CreateCargoPayload, PaginatedResponse } from "../types/domain";
import type { PaginatedQueryParams } from "../types/pagination";
import { api } from "./client";
import { buildPaginationQueryParams } from "./paginationQuery";

export async function getCargoPage(
  query: PaginatedQueryParams
): Promise<PaginatedResponse<CargoDto>> {
  const res = await api.get<PaginatedResponse<CargoDto>>("/cargo", {
    params: buildPaginationQueryParams(query),
  });
  return res.data;
}

export async function getCargoById(id: number): Promise<CargoDto> {
  const res = await api.get<CargoDto>(`/cargo/${id}`);
  return res.data;
}

export async function createCargo(payload: CreateCargoPayload): Promise<CargoDto> {
  const res = await api.post<CargoDto>("/cargo", payload);
  return res.data;
}
