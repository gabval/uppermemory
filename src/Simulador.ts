import { GestorMemoria } from './GestorMemoria';
import { PlanificadorRoundRobin } from './PlanificadorRoundRobin';
import { IPoliticaAsignacion } from './IPoliticaAsignacion';
import { Proceso } from './Proceso';
import { EstadoEsperandoMemoria } from './EstadoEsperandoMemoria';

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

    // RF02: Registrar procesos con validación de PID único y límite de memoria
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
}
