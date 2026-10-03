import { describe, it, expect } from 'vitest';
import { Simulador } from '../src/Simulador';
import { Proceso } from '../src/Proceso';
import { PoliticaFirstFit } from '../src/PoliticaFirstFit';

describe('Simulador - Test de Integración End-to-End (RF01 al RF10)', () => {
  it('Debe ejecutar una simulación completa integrando memoria, estados, CPU, E/S, coalescencia y métricas', () => {
    // 1. RF01: Configuración inicial con 100 de RAM, quantum de 2 y First Fit
    const simulador = new Simulador(100, 2, new PoliticaFirstFit());

    // 2. RF02 y RF08: Registro de procesos con memoria y E/S determinista
    // P1: 60 RAM, 4 CPU, se bloquea en su tick 2 de CPU durante 2 ticks de E/S
    const p1 = new Proceso(1, 60, 4);
    p1.configurarIo(2, 2);

    // P2: 40 RAM, 2 CPU (sin E/S)
    const p2 = new Proceso(2, 40, 2);

    // P3: 50 RAM, 2 CPU (no entrará inicialmente en RAM; debe esperar)
    const p3 = new Proceso(3, 50, 2);

    simulador.registrarProceso(p1);
    simulador.registrarProceso(p2);
    simulador.registrarProceso(p3);

    expect(simulador.getProcesosRegistrados().length).toBe(3);
    expect(p1.getNombreEstado()).toBe('NUEVO');
    expect(p2.getNombreEstado()).toBe('NUEVO');
    expect(p3.getNombreEstado()).toBe('NUEVO');

    // --- TICK 1: Admisión de P1 y P2, P3 espera memoria, P1 entra a CPU ---
    simulador.avanzarTick();
    expect(simulador.getTickActual()).toBe(1);
    expect(p1.getNombreEstado()).toBe('EJECUTANDO');
    expect(p1.getCpuRestante()).toBe(3);
    expect(p2.getNombreEstado()).toBe('LISTO');
    expect(p3.getNombreEstado()).toBe('ESPERANDO_MEMORIA'); // RF03

    // --- TICK 2: P1 ejecuta y dispara E/S al alcanzar su tick 2 de CPU (RF08) ---
    simulador.avanzarTick();
    expect(simulador.getTickActual()).toBe(2);
    expect(p1.getNombreEstado()).toBe('BLOQUEADO'); // Pasa a BLOQUEADO
    expect(p1.getTiempoBloqueoRestante()).toBe(2);
    expect(simulador.getProcesoEnCpu()).toBeNull(); // Libera la CPU

    // --- TICK 3: P1 descuenta bloqueo, P2 es despachado y ejecuta en CPU ---
    simulador.avanzarTick();
    expect(simulador.getTickActual()).toBe(3);
    expect(simulador.getProcesoEnCpu()?.getPid()).toBe(2);
    expect(p2.getNombreEstado()).toBe('EJECUTANDO');
    expect(p2.getCpuRestante()).toBe(1);
    expect(p1.getTiempoBloqueoRestante()).toBe(1); // Descuenta E/S

    // --- TICK 4: P1 termina E/S y vuelve a LISTO; P2 termina CPU y libera memoria (RF05 y RF07) ---
    simulador.avanzarTick();
    expect(simulador.getTickActual()).toBe(4);
    expect(p2.getNombreEstado()).toBe('TERMINADO'); // RF07: Finalización prioritaria
    expect(p2.getCpuRestante()).toBe(0);
    expect(p1.getNombreEstado()).toBe('LISTO'); // RF08: Retorna a la cola de listos
    expect(simulador.getListaTerminados().some(p => p.getPid() === 2)).toBe(true);

    // --- TICK 5: P1 vuelve a la CPU tras su E/S y ejecuta ---
    simulador.avanzarTick();
    expect(simulador.getTickActual()).toBe(5);
    expect(simulador.getProcesoEnCpu()?.getPid()).toBe(1);
    expect(p1.getNombreEstado()).toBe('EJECUTANDO');
    expect(p1.getCpuRestante()).toBe(1);

    // --- TICK 6: P1 termina; coalescencia fusiona memoria de P1 (60) y P2 (40) ---
    simulador.avanzarTick();
    expect(simulador.getTickActual()).toBe(6);
    expect(p1.getNombreEstado()).toBe('TERMINADO');
    // Coalescencia inmediata (RF05): ahora hay 100 de memoria libre continua

    // --- TICK 7: P3 es admitido gracias a la coalescencia, pasa a CPU y ejecuta ---
    simulador.avanzarTick();
    expect(simulador.getTickActual()).toBe(7);
    expect(p3.getNombreEstado()).toBe('EJECUTANDO');
    expect(p3.getCpuRestante()).toBe(1);

    // --- TICK 8: P3 completa su ejecución y finaliza ---
    simulador.avanzarTick();
    expect(simulador.getTickActual()).toBe(8);
    expect(p3.getNombreEstado()).toBe('TERMINADO');
    expect(simulador.getListaTerminados().length).toBe(3);
    expect(simulador.getProcesoEnCpu()).toBeNull();

    // 3. RF09 y RF10: Reporte final de métricas del sistema
    const metricas = simulador.obtenerMetricas();

    // La CPU estuvo ocupada los 8 ticks (100% de utilización)
    expect(metricas.utilizacionCpuPorcentaje).toBe(100);

    // Todos los procesos finalizaron y liberaron memoria
    expect(metricas.ocupacionMemoriaPorcentaje).toBe(0);

    // La memoria está 100% libre en un único bloque continuo: sin fragmentación externa
    expect(metricas.fragmentacionExternaPorcentaje).toBe(0);

    // Hubo al menos 1 cambio de contexto voluntario por E/S
    expect(metricas.cambiosContextoAcumulados).toBeGreaterThanOrEqual(1);
  });
});
