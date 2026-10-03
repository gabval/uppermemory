import { Proceso } from './Proceso';
import { GestorMemoria } from './GestorMemoria';
import { PlanificadorRoundRobin } from './PlanificadorRoundRobin';
import { ReporteMetricas } from './ReporteMetricas';
import { IPoliticaAsignacion } from './IPoliticaAsignacion';

import { EstadoListo } from './EstadoListo';
import { EstadoEsperandoMemoria } from './EstadoEsperandoMemoria';
import { EstadoBloqueado } from './EstadoBloqueado';
import { EstadoTerminado } from './EstadoTerminado';
import { EstadoEjecutando } from './EstadoEjecutando';

export class Simulador {
    private tickActual: number;
    private gestorMemoria: GestorMemoria;
    private planificador: PlanificadorRoundRobin;

    private procesosRegistrados: Proceso[];
    private colaEsperandoMemoria: Proceso[];
    private listaBloqueados: Proceso[];
    private listaTerminados: Proceso[];

    private cambiosContexto: number;
    private ticksCpuOcupada: number;
    private memoriaTotal: number;

    constructor(memoriaTotal: number, quantum: number, politica: IPoliticaAsignacion) {
        // Validamos sin IF. Usamos una función autoejecutable para tirar el error en caso de falsedad.
        const valido = (memoriaTotal > 0 && quantum > 0);
        !valido && (() => { throw new Error("Memoria y quantum deben ser positivos."); })();

        this.tickActual = 0;
        this.memoriaTotal = memoriaTotal;
        this.gestorMemoria = new GestorMemoria(memoriaTotal, politica);
        this.planificador = new PlanificadorRoundRobin(quantum);

        this.procesosRegistrados = [];
        this.colaEsperandoMemoria = [];
        this.listaBloqueados = [];
        this.listaTerminados = [];
        this.cambiosContexto = 0;
        this.ticksCpuOcupada = 0;
    }

    // RF02: Registro con validaciones funcionales
    public registrarProceso(proceso: Proceso): void;
    public registrarProceso(pid: number, memoriaRequerida: number, tiempoCpuTotal: number): void;
    public registrarProceso(pidOrProceso: number | Proceso, memoriaRequerida?: number, tiempoCpuTotal?: number): void {
        const proceso = (pidOrProceso instanceof Proceso)
            ? pidOrProceso
            : new Proceso(pidOrProceso, memoriaRequerida!, tiempoCpuTotal!);

        const duplicado = this.procesosRegistrados.some(p => p.getPid() === proceso.getPid());
        duplicado && (() => { throw new Error("PID duplicado."); })();

        const excedeMemoria = proceso.getMemoriaRequerida() > this.memoriaTotal;
        excedeMemoria && (() => { throw new Error("La memoria solicitada supera el total de la RAM."); })();

        this.procesosRegistrados.push(proceso);
        this.colaEsperandoMemoria.push(proceso);
    }

    // RF06: Avance determinista
    public avanzarTick(): void {
        this.procesarAdmision();
        this.procesarBloqueados();
        this.procesarCpu();
        this.tickActual++;
    }

    private procesarAdmision(): void {
        const noAdmitidos: Proceso[] = [];

        // Bucle funcional puro sin IF
        this.colaEsperandoMemoria.forEach(proceso => {
            const admitido = this.gestorMemoria.asignar(proceso);

            admitido && proceso.cambiarEstado(new EstadoListo());
            admitido && this.planificador.encolarListo(proceso);

            !admitido && proceso.cambiarEstado(new EstadoEsperandoMemoria());
            !admitido && noAdmitidos.push(proceso);
        });

        this.colaEsperandoMemoria = noAdmitidos;
    }

    private procesarBloqueados(): void {
        const siguenBloqueados: Proceso[] = [];

        this.listaBloqueados.forEach(proceso => {
            proceso.descontarBloqueo();
            const terminoBloqueo = (proceso.getTiempoBloqueoRestante() === 0);

            terminoBloqueo && proceso.cambiarEstado(new EstadoListo());
            terminoBloqueo && this.planificador.encolarListo(proceso);

            !terminoBloqueo && siguenBloqueados.push(proceso);
        });

        this.listaBloqueados = siguenBloqueados;
    }

    private procesarCpu(): void {
        this.planificador.despachar();
        const proceso = this.planificador.getProcesoEnCpu();
        const hayProceso = (proceso !== null);

        // Si hay proceso, lo pasamos a EJECUTANDO para que el patrón State acepte descontar CPU
        hayProceso && proceso!.cambiarEstado(new EstadoEjecutando());
        hayProceso && this.ticksCpuOcupada++;
        hayProceso && proceso!.consumirCpu();

        // 1. Verificamos Finalización (RF07)
        const termino = hayProceso && (proceso!.getCpuRestante() === 0);
        termino && proceso!.cambiarEstado(new EstadoTerminado());
        termino && this.gestorMemoria.liberar(proceso!);
        termino && this.planificador.liberarCpu();
        termino && this.listaTerminados.push(proceso!);

        // 2. Verificamos Bloqueo por E/S (RF08)
        const cpuConsumida = hayProceso ? (proceso!.getTiempoCpuTotal() - proceso!.getCpuRestante()) : 0;
        const tickIo = proceso?.getTickDisparoIo() ?? null;
        const tocaIo = !termino && hayProceso && (tickIo !== null) && (cpuConsumida === tickIo);

        tocaIo && proceso!.iniciarBloqueo();
        tocaIo && proceso!.cambiarEstado(new EstadoBloqueado());
        tocaIo && this.listaBloqueados.push(proceso!);
        tocaIo && this.planificador.liberarCpu();
        tocaIo && this.cambiosContexto++;

        // 3. Verificamos Desalojo por Quantum (RF07) - Solo si no terminó ni se bloqueó
        const sigueVivo = !termino && !tocaIo && hayProceso;
        const desalojado = sigueVivo && this.planificador.evaluarDesalojo().expulsadoPorQuantum;

        desalojado && proceso!.cambiarEstado(new EstadoListo());
        desalojado && this.cambiosContexto++;
    }

    // RF09: Reporte de métricas limpio y delegado
    public obtenerMetricas(): ReporteMetricas {
        return new ReporteMetricas(
            this.tickActual,
            this.ticksCpuOcupada,
            this.cambiosContexto,
            this.memoriaTotal,
            this.gestorMemoria.getMemoriaLibreTotal(),
            this.gestorMemoria.getMayorBloqueLibre()
        );
    }

    // --- CONSULTAS Y ESTADO (RF10) ---
    public getTickActual(): number { return this.tickActual; }
    public getProcesoEnCpu(): Proceso | null { return this.planificador.getProcesoEnCpu(); }
    public getColaListos(): Proceso[] { return this.planificador.getColaListos(); }
    public getListaBloqueados(): Proceso[] { return [...this.listaBloqueados]; }
    public getListaTerminados(): Proceso[] { return [...this.listaTerminados]; }
    public getColaEsperandoMemoria(): Proceso[] { return [...this.colaEsperandoMemoria]; }
    public getProcesosRegistrados(): Proceso[] { return [...this.procesosRegistrados]; }
    public obtenerMapaMemoria(): Array<{ inicio: number, tamano: number, libre: boolean, pidAsignado: number | null }> {
        return this.gestorMemoria.obtenerMapaMemoria();
    }
}