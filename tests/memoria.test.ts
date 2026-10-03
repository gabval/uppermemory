import { describe, it, expect } from 'vitest';
import { BloqueMemoria } from '../src/BloqueMemoria';
import { Proceso } from '../src/Proceso';

describe('Módulo de Gestión de Memoria (RF04 y RF05)', () => {
  describe('BloqueMemoria', () => {
    it('1. Debe inicializarse libre y permitir asignar y liberar procesos', () => {
      const bloque = new BloqueMemoria(0, 100);
      expect(bloque.getDireccionInicio()).toBe(0);
      expect(bloque.getTamanio()).toBe(100);
      expect(bloque.estaLibre()).toBe(true);
      expect(bloque.getProcesoAsignado()).toBeNull();

      const proceso = new Proceso(1, 50, 10);
      bloque.asignar(proceso);
      expect(bloque.estaLibre()).toBe(false);
      expect(bloque.getProcesoAsignado()?.getPid()).toBe(1);

      bloque.liberar();
      expect(bloque.estaLibre()).toBe(true);
      expect(bloque.getProcesoAsignado()).toBeNull();
    });

    it('2. Dividir: en asignación exacta debe retornar null y no particionar', () => {
      const bloque = new BloqueMemoria(0, 50);
      const sobrante = bloque.dividir(50);

      expect(sobrante).toBeNull();
      expect(bloque.getTamanio()).toBe(50);
      expect(bloque.getDireccionInicio()).toBe(0);
    });
  });
});
