export interface EmissionGwpValue {
  greenhouseGas: string;
  gwpValue: string;
}

export interface GreenhouseGasOption {
  value: string;
  label: string;
  aliases: string[];
  gwpValue: string;
}

export interface GreenhouseGasGroup {
  groupCode: string;
  groupName: string;
  children: GreenhouseGasOption[];
}

export const isValidGwpValue = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d+(\.\d{1,2})?$/.test(value) &&
  /[1-9]/.test(value);
