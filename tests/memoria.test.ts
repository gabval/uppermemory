import { describe, it, expect } from 'vitest';
import { BloqueMemoria } from '../src/BloqueMemoria';
import { Proceso } from '../src/Proceso';
import { PoliticaFirstFit } from '../src/PoliticaFirstFit';
import { PoliticaBestFit } from '../src/PoliticaBestFit';
import { PoliticaWorstFit } from '../src/PoliticaWorstFit';

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

    it('3. Dividir: cuando sobra espacio debe achicar el bloque actual y retornar el bloque sobrante contiguo', () => {
      const bloque = new BloqueMemoria(0, 100);
      const sobrante = bloque.dividir(40);

      expect(sobrante).not.toBeNull();
      expect(bloque.getTamanio()).toBe(40);
      expect(bloque.getDireccionInicio()).toBe(0);

      expect(sobrante!.getDireccionInicio()).toBe(40);
      expect(sobrante!.getTamanio()).toBe(60);
      expect(sobrante!.estaLibre()).toBe(true);
    });
  });

  describe('Políticas de Asignación (Patrón Strategy)', () => {
    it('4. PoliticaFirstFit: debe elegir el primer bloque libre que tenga tamaño suficiente', () => {
      const firstFit = new PoliticaFirstFit();
      const bloques = [
        new BloqueMemoria(0, 30),
        new BloqueMemoria(30, 100),
        new BloqueMemoria(130, 50)
      ];

      // Buscamos 40 unidades: bloque 1 (30) no alcanza, bloque 2 (100) es el primero que entra
      const seleccionado = firstFit.buscarBloque(bloques, 40);

      expect(seleccionado).not.toBeNull();
      expect(seleccionado!.getDireccionInicio()).toBe(30);
      expect(seleccionado!.getTamanio()).toBe(100);
    });

    it('5. PoliticaBestFit: debe elegir el bloque libre más ajustado (menor desperdicio)', () => {
      const bestFit = new PoliticaBestFit();
      const bloques = [
        new BloqueMemoria(0, 30),
        new BloqueMemoria(30, 100),
        new BloqueMemoria(130, 50)
      ];

      // Buscamos 40 unidades: entre el de 100 y el de 50, el de 50 es el mejor ajuste
      const seleccionado = bestFit.buscarBloque(bloques, 40);

      expect(seleccionado).not.toBeNull();
      expect(seleccionado!.getDireccionInicio()).toBe(130);
      expect(seleccionado!.getTamanio()).toBe(50);
    });

    it('6. PoliticaWorstFit: debe elegir el bloque libre más grande disponible', () => {
      const worstFit = new PoliticaWorstFit();
      const bloques = [
        new BloqueMemoria(0, 30),
        new BloqueMemoria(30, 100),
        new BloqueMemoria(130, 50)
      ];

      // Buscamos 20 unidades: debe elegir el bloque más grande (100)
      const seleccionado = worstFit.buscarBloque(bloques, 20);

      expect(seleccionado).not.toBeNull();
      expect(seleccionado!.getDireccionInicio()).toBe(30);
      expect(seleccionado!.getTamanio()).toBe(100);
    });
  });
});
