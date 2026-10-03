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

  it('2. Debe permitir transicionar válidamente de estado (a LISTO)', () => {
    proceso.cambiarEstado(new EstadoListo());
    expect(proceso.getNombreEstado()).toBe('LISTO');
  });

  it('3. En estado EJECUTANDO debe consumir CPU e incrementar el quantum', () => {
    proceso.cambiarEstado(new EstadoEjecutando());
    expect(proceso.getNombreEstado()).toBe('EJECUTANDO');

    proceso.consumirCpu();
    expect(proceso.getCpuRestante()).toBe(4);
    expect(proceso.getQuantumConsumido()).toBe(1);
  });

  it('4. En estados distintos de EJECUTANDO (como NUEVO o LISTO), consumirCpu NO debe tener efecto', () => {
    // Estando en NUEVO:
    proceso.consumirCpu();
    expect(proceso.getCpuRestante()).toBe(5);
    expect(proceso.getQuantumConsumido()).toBe(0);

    // Estando en LISTO:
    proceso.cambiarEstado(new EstadoListo());
    proceso.consumirCpu();
    expect(proceso.getCpuRestante()).toBe(5);
    expect(proceso.getQuantumConsumido()).toBe(0);
  });

  it('5. En estado BLOQUEADO debe descontar el temporizador de bloqueo', () => {
    proceso.configurarIo(2, 3);
    proceso.iniciarBloqueo();
    proceso.cambiarEstado(new EstadoBloqueado());
    expect(proceso.getNombreEstado()).toBe('BLOQUEADO');
    expect(proceso.getTiempoBloqueoRestante()).toBe(3);

    proceso.descontarBloqueo();
    expect(proceso.getTiempoBloqueoRestante()).toBe(2);

    proceso.descontarBloqueo();
    expect(proceso.getTiempoBloqueoRestante()).toBe(1);
  });

  it('6. En estado TERMINADO debe ser inmutable: no permite salir a ningún otro estado', () => {
    proceso.cambiarEstado(new EstadoTerminado());
    expect(proceso.getNombreEstado()).toBe('TERMINADO');

    // Intentamos cambiar a LISTO o a EJECUTANDO: debe ignorarlo
    proceso.cambiarEstado(new EstadoListo());
    expect(proceso.getNombreEstado()).toBe('TERMINADO');

    proceso.cambiarEstado(new EstadoEjecutando());
    expect(proceso.getNombreEstado()).toBe('TERMINADO');
  });

  it('7. Debe reiniciar el quantum consumido a 0 al solicitarlo', () => {
    proceso.cambiarEstado(new EstadoEjecutando());
    proceso.consumirCpu();
    proceso.consumirCpu();
    expect(proceso.getQuantumConsumido()).toBe(2);

    proceso.reiniciarQuantum();
    expect(proceso.getQuantumConsumido()).toBe(0);
  });
});
