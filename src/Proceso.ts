import { IEstadoProceso } from "./IEstadoProceso";
import { EstadoNuevo } from "./EstadoNuevo";

export class Proceso {

    private pid: number;
    private memoriaRequerida: number;
    private tiempoCpuTotal: number;

    private cpuRestante: number;
    private quantumConsumido: number;
    private tiempoBloqueoRestante: number;

    private tickDisparoIo: number | null = null;
    private duracionIo: number = 0;

    private estadoActual: IEstadoProceso;

    public constructor(pid: number, memoriaRequerida: number, tiempoCpuTotal: number) {

        this.pid = pid;
        this.memoriaRequerida = memoriaRequerida;
        this.tiempoCpuTotal = tiempoCpuTotal;
        this.cpuRestante = tiempoCpuTotal;
        this.quantumConsumido = 0;
        this.tiempoBloqueoRestante = 0;

        this.estadoActual = new EstadoNuevo();
    }

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
    // y le pregunta al estado como se llama
    public getNombreEstado(): string {
        return this.estadoActual.getNombre();
    }
    // CONFIGURACIÓN DE E/S
    public configurarIo(tickDisparo: number, duracion: number): void {
        this.tickDisparoIo = tickDisparo;
        this.duracionIo = duracion;
    }
    public getTickDisparoIo(): number | null { return this.tickDisparoIo; }

    public iniciarBloqueo(): void {
        this.tiempoBloqueoRestante = this.duracionIo;
    }

    public reiniciarQuantum(): void {
        this.quantumConsumido = 0;
    }

    //PATRÓN STATE 

    public consumirCpu(): void {
        this.estadoActual.consumirCpu(this);
    }

    public descontarBloqueo(): void {
        this.estadoActual.descontarBloqueo(this);
    }

    public cambiarEstado(nuevoEstado: IEstadoProceso): void {
        this.estadoActual.cambiarEstado(this, nuevoEstado);
    }
    // --- MUTADORES INTERNOS (los llama el Estado) ---
    public setEstado(nuevoEstado: IEstadoProceso): void {
        this.estadoActual = nuevoEstado;
    }

    public reducirContadoresCpu(): void {
        this.cpuRestante--;
        this.quantumConsumido++;
    }

    public reducirTemporizadorBloqueo(): void {
        this.tiempoBloqueoRestante--;
    }
}