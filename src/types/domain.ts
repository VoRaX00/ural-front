/** Ответ пагинированного списка (Spring / типичный REST). */
export interface PaginatedResponse<T> {
  currentPageNumber: number;
  totalPageCount: number;
  totalResultCount: number;
  items: T[];
  itemsOnPage: number;
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
}

/** Поля для POST /cars (без id, пользователя и меток времени). */
export interface CreateCarPayload {
  carType: string;
  carName: string;
  carModel: string;
  yearProduction: number;
  vinNumber: string;
}

export interface AddressDto {
  id?: string;
  country?: string;
  region?: string;
  city?: string;
  street?: string;
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
  type: string;
}
