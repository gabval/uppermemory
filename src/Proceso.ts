import { EstadoProceso } from "./EstadoProceso"

export class Proceso {

    public pid: number;
    public memoriaRequerida: number;
    public tiempoCPUTotal: number;

    public constructor(pid: number, memoriaRequerida: number, tiempoCPUTotal: number) {

        this.pid = pid;
        this.memoriaRequerida = memoriaRequerida;
        this.tiempoCPUTotal = tiempoCPUTotal;
    }
}