/** Ответ пагинированного списка (Spring / типичный REST). */
export interface PaginatedResponse<T> {
  currentPageNumber: number;
  totalPageCount: number;
  totalResultCount: number;
  items: T[];
  itemsOnPage: number;
}

export interface ContractDto {
  id: number;
  carId?: number;
  cargoId?: number;
  car?: CarDto;
  cargo?: CargoDto;
  status?: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContractPayload {
  carId: number;
  cargoId: number;
  price: number;
}

export interface CarDto {
  id: string;
  carType: string;
  carName: string;
  carModel: string;
  yearProduction: number;
  userUuid: string;
  createdAt: string;
  updatedAt: string;
  vinNumber: string;
  fileIds?: number[] | null;
}

/** Поля для POST /cars (без id, пользователя и меток времени). */
export interface CreateCarPayload {
  carType: string;
  carName: string;
  carModel: string;
  yearProduction: number;
  vinNumber: string;
  fileIds?: number[] | null;
}

export interface AddressDto {
  id?: string;
  country?: string;
  region?: string;
  city?: string;
  street?: string;
  house?: string;
  building?: string;
  apartment?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface CargoDto {
  id: number;
  userUuid: string;
  name: string;
  length: number;
  width: number;
  height: number;
  volume: number;
  weight: number;
  loadingPlace: AddressDto;
  unloadingPlace: AddressDto;
  price: number;
  comment?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  fileIds?: number[] | null;
}

export interface CreateCargoPayload {
  name: string;
  length: number;
  width: number;
  height: number;
  volume: number;
  weight: number;
  loadingPlace: AddressDto;
  unloadingPlace: AddressDto;
  price: number;
  comment?: string;
  status: string;
  fileIds?: number[];
}
