import { describe, it, expect, beforeEach } from 'vitest';
import { BloqueMemoria } from '../src/BloqueMemoria';
import { Proceso } from '../src/Proceso';
import { PoliticaFirstFit } from '../src/PoliticaFirstFit';
import { PoliticaBestFit } from '../src/PoliticaBestFit';
import { PoliticaWorstFit } from '../src/PoliticaWorstFit';
import { GestorMemoria } from '../src/GestorMemoria';

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

    it('7. Si ningún bloque libre alcanza, la política debe retornar null', () => {
      const firstFit = new PoliticaFirstFit();
      const bloques = [
        new BloqueMemoria(0, 30),
        new BloqueMemoria(30, 100),
        new BloqueMemoria(130, 50)
      ];

      const seleccionado = firstFit.buscarBloque(bloques, 200);
      expect(seleccionado).toBeNull();
    });
  });

  describe('GestorMemoria y Particionamiento (RF04 y RF05)', () => {
    let gestor: GestorMemoria;

    beforeEach(() => {
      // Memoria total de 100 con First Fit
      gestor = new GestorMemoria(100, new PoliticaFirstFit());
    });

    it('8. Debe asignar memoria particionando bloques y rechazando si excede el espacio disponible', () => {
      const p1 = new Proceso(1, 40, 5);
      const asignadoP1 = gestor.asignar(p1);
      expect(asignadoP1).toBe(true);
      expect(gestor.getMemoriaLibreTotal()).toBe(60);

      const p2 = new Proceso(2, 50, 5);
      const asignadoP2 = gestor.asignar(p2);
      expect(asignadoP2).toBe(true);
      expect(gestor.getMemoriaLibreTotal()).toBe(10);

      // Intentamos asignar un proceso de 20 cuando solo quedan 10 libres
      const p3 = new Proceso(3, 20, 5);
      const asignadoP3 = gestor.asignar(p3);
      expect(asignadoP3).toBe(false);
      expect(gestor.getMemoriaLibreTotal()).toBe(10);
    });

    it('9. Coalescencia simple: debe fusionar inmediatamente bloques libres adyacentes al liberar', () => {
      const p1 = new Proceso(1, 40, 5);
      const p2 = new Proceso(2, 60, 5);

      gestor.asignar(p1);
      gestor.asignar(p2);
      expect(gestor.getMemoriaLibreTotal()).toBe(0);

      // Liberamos p2 (que estaba al final de la memoria)
      gestor.liberar(p2);
      expect(gestor.getMemoriaLibreTotal()).toBe(60);

      // Liberamos p1: ahora p1 (0..40) y p2 (40..100) quedan libres y deben fusionarse en un único bloque de 100
      gestor.liberar(p1);
      expect(gestor.getMemoriaLibreTotal()).toBe(100);
      expect(gestor.getMayorBloqueLibre()).toBe(100);

      const mapa = gestor.obtenerMapaMemoria();
      expect(mapa.length).toBe(1);
      expect(mapa[0].inicio).toBe(0);
      expect(mapa[0].tamano).toBe(100);
      expect(mapa[0].libre).toBe(true);
    });

    it('10. Coalescencia en cadena: debe fusionar a izquierda y derecha si un proceso liberado estaba en el medio', () => {
      // Creamos 3 particiones: p1 (30), p2 (40), p3 (30)
      const p1 = new Proceso(1, 30, 5);
      const p2 = new Proceso(2, 40, 5);
      const p3 = new Proceso(3, 30, 5);

      gestor.asignar(p1);
      gestor.asignar(p2);
      gestor.asignar(p3);

      // Liberamos p1 y p3 dejando a p2 en el centro
      gestor.liberar(p1); // [0..30 libre], [30..70 ocupado (p2)], [70..100 ocupado (p3)]
      gestor.liberar(p3); // [0..30 libre], [30..70 ocupado (p2)], [70..100 libre]

      expect(gestor.obtenerMapaMemoria().length).toBe(3);
      expect(gestor.getMayorBloqueLibre()).toBe(30);

      // Al liberar p2, debe ocurrir coalescencia en cadena fusionando los 3 bloques en uno solo de 100
      gestor.liberar(p2);
      expect(gestor.getMemoriaLibreTotal()).toBe(100);
      expect(gestor.getMayorBloqueLibre()).toBe(100);

      const mapa = gestor.obtenerMapaMemoria();
      expect(mapa.length).toBe(1);
      expect(mapa[0].inicio).toBe(0);
      expect(mapa[0].tamano).toBe(100);
      expect(mapa[0].libre).toBe(true);
    });
  });
});
