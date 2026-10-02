import { EstadoProceso } from "./EstadoProceso"
import { IEstadoProceso } from "./IEstadoProceso";

export class Proceso {

    private pid: number;
    private memoriaRequerida: number;
    private tiempoCpuTotal: number;

    private cpuRestante: number;
    private quantumConsumido: number;
    private tiempoBloqueoRestante: number;

    private estadoActual: IEstadoProceso;

    public constructor(pid: number, memoriaRequerida: number, tiempoCPUTotal: number) {

        this.pid = pid;
        this.memoriaRequerida = memoriaRequerida;
        this.tiempoCPUTotal = tiempoCPUTotal;
        this.cpuRestante = tiempoCPUTotal;
        this.quantumConsumido = 0;
        this.tiempoBloqueoRestante = 0;

        this.estadoActual = new Estado;
    }
}