type CarOption = {
  value: string;
  label: string;
};

export const carTypeOptions: CarOption[] = [
  { value: "PASSENGER", label: "Легковой автомобиль" },
  { value: "CARGO_TRUCK", label: "Грузовой автомобиль" },
];

const carTypeLabelByValue = new Map(carTypeOptions.map((option) => [option.value, option.label]));
const carTypeValueByLabel = new Map(carTypeOptions.map((option) => [option.label, option.value]));

export function getCarTypeLabel(value: string) {
  return carTypeLabelByValue.get(value) ?? value;
}

export function getCarTypeValue(value: string) {
  return carTypeValueByLabel.get(value) ?? value;
}

export function formatCarType(value: string | null | undefined) {
  if (!value) return "—";
  return getCarTypeLabel(value);
}
