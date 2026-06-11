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

export interface NotificationContractDto {
  id: number;
  title: string;
  body: string;
  userUuids: string[];
  contractId?: number | null;
  isRead: boolean;
}

export interface CreateContractPayload {
  carId: number;
  cargoId: number;
  price: number;
}

export type CarPhotoAnalysisStatus =
  | "EXCELLENT"
  | "GOOD"
  | "NEEDS_REPAIR"
  | "CRITICAL"
  | "UNKNOWN";

export interface CarDto {
  id: string;
  carType: string;
  carName: string;
  carModel: string;
  bodyType?: string[] | null;
  loadingType?: string[] | null;
  loadCapacity?: number | null;
  yearProduction: number;
  userUuid: string;
  createdAt: string;
  updatedAt: string;
  vinNumber: string;
  fileIds?: number[] | null;
  photoAnalysisSummary?: string | null;
  photoAnalysisStatus?: CarPhotoAnalysisStatus | null;
}

/** Поля для POST /cars (без id, пользователя и меток времени). */
export interface CreateCarPayload {
  carType: string;
  carName: string;
  carModel: string;
  bodyType: string[];
  loadingType: string[];
  loadCapacity?: number | null;
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
  bodyTypes: string[];
  loadingTypes: string[];
  unloadingTypes: string[];
  length: number;
  width: number;
  height: number;
  volume: number;
  weight: number;
  loadingPlace: AddressDto;
  unloadingPlace: AddressDto;
  routePoints?: AddressDto[] | null;
  price: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  fileIds?: number[] | null;
}

export interface CreateCargoPayload {
  name: string;
  bodyTypes: string[];
  loadingTypes: string[];
  unloadingTypes: string[];
  length: number;
  width: number;
  height: number;
  volume: number;
  weight: number;
  loadingPlace: AddressDto;
  unloadingPlace: AddressDto;
  routePoints?: AddressDto[];
  price: number;
  comment?: string;
  fileIds?: number[];
}

export interface AvatarRequest {
  photoId?: number;
  photoThumbnailId?: number;
  cropX?: number;
  cropY?: number;
  cropSize?: number;
}

export interface AvatarDto {
  id: number;
  photoId?: number;
  photoThumbnailId?: number;
  cropX?: number;
  cropY?: number;
  cropSize?: number;
}

export interface AvatarUploadMetadata {
  cropX: number;
  cropY: number;
  cropSize: number;
}

export interface AvatarResponse {
  photoId: number;
  photoThumbnailId: number;
  cropX: number;
  cropY: number;
  cropSize: number;
}

export interface UserDto {
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  phoneNumber?: string;
  avatar?: AvatarDto | null;
}

export interface UserRequest {
  email: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  phoneNumber?: string;
  avatar?: AvatarRequest | null;
}
