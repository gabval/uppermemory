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
    public registrarProceso(pid: number, memoriaRequerida: number, tiempoCpuTotal: number): void {
        const duplicado = this.procesosRegistrados.some(p => p.getPid() === pid);
        duplicado && (() => { throw new Error("PID duplicado."); })();

        const excedeMemoria = memoriaRequerida > this.memoriaTotal;
        excedeMemoria && (() => { throw new Error("La memoria solicitada supera el total de la RAM."); })();

        const nuevoProceso = new Proceso(pid, memoriaRequerida, tiempoCpuTotal);
        this.procesosRegistrados.push(nuevoProceso);
        this.colaEsperandoMemoria.push(nuevoProceso);
    }
    // RF06: Avance determinista
    public avanzarTick(): void {
        this.procesarAdmision();
        this.procesarBloqueados();
        this.procesarCpu();
        this.tickActual++;
    }