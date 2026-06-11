import type {
  ContractDto,
  CreateContractPayload,
  PaginatedResponse,
} from "../types/domain";
import type { PaginatedQueryParams } from "../types/pagination";
import { api } from "./client";
import { buildPaginationQueryParams } from "./paginationQuery";

export async function createContract(
  payload: CreateContractPayload
): Promise<ContractDto> {
  const res = await api.post<ContractDto>("/contracts", payload);
  return res.data;
}

export async function getContractsPage(
  query: PaginatedQueryParams
): Promise<PaginatedResponse<ContractDto>> {
  const res = await api.get<PaginatedResponse<ContractDto>>("/contracts", {
    params: buildPaginationQueryParams(query),
  });
  return res.data;
}

export async function getContractById(id: number): Promise<ContractDto> {
  const res = await api.get<ContractDto>(`/contracts/${id}`);
  return res.data;
}

export async function updateContractStatus(
  id: number,
  options?: { isClose?: boolean }
): Promise<ContractDto> {
  const res = await api.patch<ContractDto>(`/contracts/${id}/status`, null, {
    params: options?.isClose ? { isClose: true } : undefined,
  });
  return res.data;
}
