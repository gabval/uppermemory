import { Proceso } from "./IProceso";

export class PlanificadorRoundRobin {
    private quantumMaximo: number;
    private colaListos: Proceso[];
    private procesoEnCpu: Proceso | null;

    constructor(quantumMaximo: number) {
        this.quantumMaximo = quantumMaximo;
        this.colaListos = [];
        this.procesoEnCpu = null;
    }
    public getProcesoEnCpu(): Proceso | null {
        return this.procesoEnCpu;
    }

    public getColaListos(): Proceso[] {
        return [...this.colaListos];
    }

    public encolarListo(proceso: Proceso): void {
        this.colaListos.push(proceso);
    }

    public despachar(): void {
        // Evaluamos si la CPU está vacía y hay fila
        const debeDespachar = (this.procesoEnCpu === null && this.colaListos.length > 0);

        // Asignación sin IF: Si debe despachar, saca el primero de la cola y lo pone en CPU
        debeDespachar && (this.procesoEnCpu = this.colaListos.shift() || null);

        // Si hay un proceso en CPU (el ? evita errores si es null), le reiniciamos el quantum
        this.procesoEnCpu?.reiniciarQuantum();
    }

    public liberarCpu(): void {
        this.procesoEnCpu = null;
    }
}




