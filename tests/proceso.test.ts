import { describe, it, expect, beforeEach } from 'vitest';
import { Proceso } from './Proceso';
import { EstadoListo } from './EstadoListo';
import { EstadoEjecutando } from './EstadoEjecutando';
import { EstadoBloqueado } from './EstadoBloqueado';
import { EstadoTerminado } from './EstadoTerminado';

describe('Clase Proceso y Patrón State', () => {
  let proceso: Proceso;

  // Antes de cada test, instanciamos un proceso fresco
  beforeEach(() => {
    // PID: 1, Memoria: 100, CPU Total: 5
    proceso = new Proceso(1, 100, 5);
  });

  it('1. Debe inicializarse correctamente con el estado NUEVO', () => {
    // Verificamos el estado inicial exigido por el RF03[cite: 10]
    expect(proceso.getNombreEstado()).toBe('NUEVO');
    expect(proceso.getPid()).toBe(1);
    expect(proceso.getCpuRestante()).toBe(5);
    expect(proceso.getQuantumConsumido()).toBe(0);
  });
}
