import type { ContractDto } from "../../types/domain";

const statusTextByCode: Record<string, string> = {
  AGREEMENT: "Согласование",
  ACTIVE: "Активен",
  COMPLETED: "Завершён",
  CANCELED: "Отменён",
  CANCELLED: "Отменён",
};

export function getContractStatusText(status: string | undefined): string {
  if (!status) return "—";
  return statusTextByCode[status] ?? status;
}

export function getContractCarTitle(contract: ContractDto): string {
  if (contract.car) {
    return [contract.car.carName, contract.car.carModel].filter(Boolean).join(" ") || "Транспорт";
  }
  return contract.carId ? `Транспорт #${contract.carId}` : "Транспорт не указан";
}

export function getContractCargoTitle(contract: ContractDto): string {
  if (contract.cargo?.name) return contract.cargo.name;
  return contract.cargoId ? `Груз #${contract.cargoId}` : "Груз не указан";
}
