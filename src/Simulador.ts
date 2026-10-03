import { GestorMemoria } from './GestorMemoria';
import { PlanificadorRoundRobin } from './PlanificadorRoundRobin';
import { IPoliticaAsignacion } from './IPoliticaAsignacion';
import { Proceso } from './Proceso';
import { EstadoEsperandoMemoria } from './EstadoEsperandoMemoria';
import { EstadoListo } from './EstadoListo';
import { EstadoEjecutando } from './EstadoEjecutando';
import { EstadoBloqueado } from './EstadoBloqueado';
import { EstadoTerminado } from './EstadoTerminado';

export class Simulador {
    private memoriaTotal: number;
    private quantum: number;
    private tickActual: number;
    private ticksCpuOcupada: number;
    private cambiosContexto: number;

    private gestorMemoria: GestorMemoria;
    private planificador: PlanificadorRoundRobin;

    private procesosRegistrados: Proceso[];
    private procesosEsperandoMemoria: Proceso[];
    private procesosBloqueados: Proceso[];
    private procesosTerminados: Proceso[];

    constructor(memoriaTotal: number, quantum: number, politica: IPoliticaAsignacion) {
        // RF01: Validación sin crear estados parciales
        const esInvalido = memoriaTotal <= 0 || quantum <= 0 || !Number.isInteger(memoriaTotal) || !Number.isInteger(quantum);
        if (esInvalido) {
            throw new Error("Configuración inválida: memoriaTotal y quantum deben ser enteros positivos.");
        }

        this.memoriaTotal = memoriaTotal;
        this.quantum = quantum;
        this.tickActual = 0;
        this.ticksCpuOcupada = 0;
        this.cambiosContexto = 0;

        this.gestorMemoria = new GestorMemoria(memoriaTotal, politica);
        this.planificador = new PlanificadorRoundRobin(quantum);

        this.procesosRegistrados = [];
        this.procesosEsperandoMemoria = [];
        this.procesosBloqueados = [];
        this.procesosTerminados = [];
    }

    public registrarProceso(proceso: Proceso): void {
        const pidDuplicado = this.procesosRegistrados.some(p => p.getPid() === proceso.getPid());
        const excedeMemoria = proceso.getMemoriaRequerida() > this.memoriaTotal;

        if (pidDuplicado || excedeMemoria) {
            throw new Error("Proceso inválido: PID duplicado o memoria requerida excede el total.");
        }

        this.procesosRegistrados.push(proceso);
        proceso.cambiarEstado(new EstadoEsperandoMemoria());
        this.procesosEsperandoMemoria.push(proceso);
    }

    private faseAdmision(): void {
        this.procesosEsperandoMemoria = this.procesosEsperandoMemoria.filter(proceso => {
            const asignado = this.gestorMemoria.asignar(proceso);
            if (asignado) {
                proceso.cambiarEstado(new EstadoListo());
                this.planificador.encolarListo(proceso);
                return false; // Sale de la cola de espera de memoria
            }
            return true; // Se mantiene esperando memoria
        });
    }

    private faseActualizarBloqueados(): void {
        this.procesosBloqueados = this.procesosBloqueados.filter(proceso => {
            proceso.descontarBloqueo();
            const desbloqueado = proceso.getTiempoBloqueoRestante() <= 0;
            if (desbloqueado) {
                proceso.cambiarEstado(new EstadoListo());
                this.planificador.encolarListo(proceso);
                return false; // Sale de la lista de bloqueados
            }
            return true; // Sigue bloqueado
        });
    }

    // RF06, RF07, RF08: Fase 3 - Despacho, consumo de CPU y prioridades (Finalización > E/S > Quantum)
    private faseEjecucionCpu(): void {
        this.planificador.despachar();
        const proceso = this.planificador.getProcesoEnCpu();

        if (!proceso) {
            return;
        }

        proceso.cambiarEstado(new EstadoEjecutando());
        this.ticksCpuOcupada++;
        proceso.consumirCpu();

        // 1. Prioridad: Finalización del proceso (RF07)
        if (proceso.getCpuRestante() === 0) {
            proceso.cambiarEstado(new EstadoTerminado());
            this.gestorMemoria.liberar(proceso);
            this.procesosTerminados.push(proceso);
            this.planificador.liberarCpu();
            return;
        }

        // 2. Prioridad: Evento determinista de E/S (RF08)
        const cpuConsumida = proceso.getTiempoCpuTotal() - proceso.getCpuRestante();
        const debeBloquearse = proceso.getTickDisparoIo() !== null && cpuConsumida === proceso.getTickDisparoIo();

        if (debeBloquearse) {
            proceso.iniciarBloqueo();
            proceso.cambiarEstado(new EstadoBloqueado());
            this.procesosBloqueados.push(proceso);
            this.cambiosContexto++; // Bloqueo de E/S cuenta como cambio de contexto (RF09)
            this.planificador.liberarCpu();
            return;
        }

        // 3. Prioridad: Desalojo o rotación por fin de quantum (RF07)
        const { expulsadoPorQuantum } = this.planificador.evaluarDesalojo();
        if (expulsadoPorQuantum) {
            proceso.cambiarEstado(new EstadoListo());
            this.cambiosContexto++; // Expulsión por quantum con otros listos cuenta como cambio de contexto (RF09)
        }
    }

    // RF06: Fase 4 - Avance del reloj
    private faseActualizarRelojYMetricas(): void {
        this.tickActual++;
    }

    // RF06: Avanzar un tick de forma determinista ejecutando las 4 fases en orden
    public avanzarTick(): void {
        this.faseAdmision();
        this.faseActualizarBloqueados();
        this.faseEjecucionCpu();
        this.faseActualizarRelojYMetricas();
    }
}
