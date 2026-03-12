
import { complex, multiply, cos, sin, exp, arg, Complex, matrix, norm, Matrix } from 'mathjs';
import { QubitState, BlochCoordinates, CalculationDetails } from '../types';

const INV_SQRT2 = 1 / Math.sqrt(2);

export const INITIAL_STATE: QubitState = {
  alpha: complex(Math.cos(0.95), 0),
  beta: multiply(exp(complex(0, 0.9)), Math.sin(0.95)) as Complex
};

export const GATES = {
  I: matrix([[1, 0], [0, 1]]),
  X: matrix([[0, 1], [1, 0]]),
  Y: matrix([[0, complex(0, -1)], [complex(0, 1), 0]]),
  Z: matrix([[1, 0], [0, -1]]),
  H: matrix([[1 / Math.sqrt(2), 1 / Math.sqrt(2)], [1 / Math.sqrt(2), -1 / Math.sqrt(2)]]),
  S: matrix([[1, 0], [0, complex(0, 1)]]),
  T: matrix([[1, 0], [0, exp(complex(0, Math.PI / 4))]]),
};

export const getGateMatrix = (gate: string, thetaParam: number = 0): Matrix => {
  if (gate === 'RX') {
    const t = thetaParam;
    return matrix([
      [cos(t / 2), complex(0, -sin(t / 2))],
      [complex(0, -sin(t / 2)), cos(t / 2)]
    ]);
  } else if (gate === 'RY') {
    const t = thetaParam;
    return matrix([
      [cos(t / 2), -sin(t / 2)],
      [sin(t / 2), cos(t / 2)]
    ]);
  } else if (gate === 'RZ') {
    const t = thetaParam;
    return matrix([
      [exp(complex(0, -t / 2)), 0],
      [0, exp(complex(0, t / 2))]
    ]);
  } else {
    return GATES[gate as keyof typeof GATES] || GATES.I;
  }
};

/**
 * Ensures a value is a Complex object.
 */
const toComplex = (val: any): Complex => {
  if (typeof val === 'number') return complex(val, 0);
  if (val && typeof val.re === 'number') return val as Complex;
  return complex(0, 0);
};

export const applyGateWithDetails = (state: QubitState, gate: string, gateName: string, thetaParam: number = 0): { newState: QubitState, details: CalculationDetails } => {
  const gateMatrix = getGateMatrix(gate, thetaParam);
  // MathJS multiply can return a Matrix or an Array depending on environment/setup
  const result = multiply(gateMatrix, [state.alpha, state.beta]);
  
  const rawAlpha = toComplex((result as any).get ? (result as any).get([0]) : (result as any)[0]);
  const rawBeta = toComplex((result as any).get ? (result as any).get([1]) : (result as any)[1]);
  
  const rawResult = { alpha: rawAlpha, beta: rawBeta };

  let finalAlpha = rawAlpha;
  let finalBeta = rawBeta;
  let phaseCorrection: Complex | null = null;

  const nA = norm(rawAlpha) as number;
  const nB = norm(rawBeta) as number;

  if (nA > 1e-10) {
    const phase = arg(rawAlpha);
    phaseCorrection = exp(complex(0, -phase));
    finalAlpha = multiply(rawAlpha, phaseCorrection) as Complex;
    finalBeta = multiply(rawBeta, phaseCorrection) as Complex;
  } else if (nB > 1e-10) {
    const phase = arg(rawBeta);
    phaseCorrection = exp(complex(0, -phase));
    finalAlpha = multiply(rawAlpha, phaseCorrection) as Complex;
    finalBeta = multiply(rawBeta, phaseCorrection) as Complex;
  }

  const newState = { alpha: finalAlpha, beta: finalBeta };

  return {
    newState,
    details: {
      gateId: gate,
      gateName,
      input: state,
      matrix: gateMatrix,
      rawResult,
      finalResult: newState,
      phaseCorrection
    }
  };
};

export const applyGate = (state: QubitState, gate: string, thetaParam: number = 0): QubitState => {
  return applyGateWithDetails(state, gate, gate, thetaParam).newState;
};

export const getBlochCoordinates = (state: QubitState): BlochCoordinates => {
  const a = state.alpha;
  const b = state.beta;
  
  const x = 2 * (a.re * b.re + a.im * b.im);
  const y = 2 * (a.re * b.im - a.im * b.re);
  const z = (a.re * a.re + a.im * a.im) - (b.re * b.re + b.im * b.im);
  
  const theta = Math.acos(Math.max(-1, Math.min(1, z)));
  const phi = Math.atan2(y, x);
  
  return { x, y, z, theta, phi };
};

export const formatComplex = (c: any, precision: number = 3): string => {
  if (c === undefined || c === null) return "0.000";
  
  const comp = toComplex(c);
  const re = Math.abs(comp.re) < 1e-4 ? 0 : comp.re;
  const im = Math.abs(comp.im) < 1e-4 ? 0 : comp.im;
  
  if (im === 0) return re.toFixed(precision);
  if (re === 0) return `${im.toFixed(precision)}i`;
  
  return `${re.toFixed(precision)} ${im >= 0 ? '+' : '-'} ${Math.abs(im).toFixed(precision)}i`;
};
