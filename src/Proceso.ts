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

        public getPid(): number {
        return this.pid;
    }

    public getMemoriaRequerida(): number {
        return this.memoriaRequerida;
    }

    public getCpuRestante(): number {
        return this.cpuRestante;
    }

    public getQuantumConsumido(): number {
        return this.quantumConsumido;
    }

    public getTiempoBloqueoRestante(): number {
        return this.tiempoBloqueoRestante;
    }


}
}