
import { Complex } from 'mathjs';

export interface QubitState {
  alpha: Complex;
  beta: Complex;
}

export interface BlochCoordinates {
  x: number;
  y: number;
  z: number;
  theta: number;
  phi: number;
}

export type GateType = 'I' | 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T' | 'RX' | 'RY' | 'RZ' | 'RESET';

export interface GateInfo {
  id: GateType;
  name: string;
  description: string;
  simpleExplanation: string;
  matrixLabel: string;
}

export interface HistoryEntry {
  gate: GateType;
  timestamp: number;
  state: QubitState;
}

export interface CalculationDetails {
  gateId: string;
  gateName: string;
  input: QubitState;
  matrix: number[][][] | any; // Simplified for display
  rawResult: QubitState;
  finalResult: QubitState;
  phaseCorrection: Complex | null;
}
