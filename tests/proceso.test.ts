import { describe, it, expect, beforeEach } from 'vitest';
import { Proceso } from '../src/Proceso';
import { EstadoListo } from '../src/EstadoListo';
import { EstadoEjecutando } from '../src/EstadoEjecutando';
import { EstadoBloqueado } from '../src/EstadoBloqueado';
import { EstadoTerminado } from '../src/EstadoTerminado';

describe('Clase Proceso y Patrón State', () => {
  let proceso: Proceso;

  // Antes de cada test, instanciamos un proceso fresco
  beforeEach(() => {
    // PID: 1, Memoria: 100, CPU Total: 5
    proceso = new Proceso(1, 100, 5);
  });

  it('1. Debe inicializarse correctamente con el estado NUEVO', () => {
    // Verificamos el estado inicial exigido por el RF03
    expect(proceso.getNombreEstado()).toBe('NUEVO');
    expect(proceso.getPid()).toBe(1);
    expect(proceso.getCpuRestante()).toBe(5);
    expect(proceso.getQuantumConsumido()).toBe(0);
  });
});
