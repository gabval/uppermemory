import { describe, it, expect, beforeEach } from 'vitest';
import { PlanificadorRoundRobin } from '../src/PlanificadorRoundRobin';
import { Proceso } from '../src/Proceso';

describe('Planificador Round Robin (RF07)', () => {
  let planificador: PlanificadorRoundRobin;

  beforeEach(() => {
    // Quantum máximo de 3
    planificador = new PlanificadorRoundRobin(3);
  });

  it('1. Debe inicializarse con la CPU libre y la cola de listos vacía', () => {
    expect(planificador.getProcesoEnCpu()).toBeNull();
    expect(planificador.getColaListos()).toEqual([]);
  });
});
