import { describe, it, expect, beforeEach } from 'vitest';
import { PlanificadorRoundRobin } from '../src/PlanificadorRoundRobin';
import { Proceso } from '../src/Proceso';
import { EstadoEjecutando } from '../src/EstadoEjecutando';

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

  it('2. Despachar: debe asignar a la CPU el primer proceso de la cola en orden FIFO y reiniciar su quantum', () => {
    const p1 = new Proceso(1, 50, 10);
    const p2 = new Proceso(2, 50, 10);

    planificador.encolarListo(p1);
    planificador.encolarListo(p2);

    expect(planificador.getColaListos().length).toBe(2);

    planificador.despachar();

    // p1 debe estar en CPU y quedar solo p2 en la cola de listos
    expect(planificador.getProcesoEnCpu()?.getPid()).toBe(1);
    expect(planificador.getProcesoEnCpu()?.getQuantumConsumido()).toBe(0);

    const cola = planificador.getColaListos();
    expect(cola.length).toBe(1);
    expect(cola[0].getPid()).toBe(2);
  });

  it('3. Si la CPU ya tiene un proceso, despachar() no debe sobreescribir ni resetear el quantum del proceso en ejecución', () => {
    const p1 = new Proceso(1, 50, 10);
    const p2 = new Proceso(2, 50, 10);

    planificador.encolarListo(p1);
    planificador.encolarListo(p2);
    planificador.despachar();

    // El proceso en CPU consume 2 unidades de quantum
    p1.cambiarEstado(new EstadoEjecutando());
    p1.consumirCpu();
    p1.consumirCpu();
    expect(p1.getQuantumConsumido()).toBe(2);

    // Llamamos despachar() nuevamente en el siguiente tick
    planificador.despachar();

    // El proceso debe seguir siendo p1 y su quantum NO debe haberse reseteado a 0
    expect(planificador.getProcesoEnCpu()?.getPid()).toBe(1);
    expect(planificador.getProcesoEnCpu()?.getQuantumConsumido()).toBe(2);
  });
});
