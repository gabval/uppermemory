import { Proceso } from "./Proceso";

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

        // Si debe despachar, saca el primero de la cola y lo pone en CPU
        debeDespachar && (this.procesoEnCpu = this.colaListos.shift() || null);

        // Si se despachó un proceso, le reiniciamos el quantum
        debeDespachar && this.procesoEnCpu?.reiniciarQuantum();
    }

    public liberarCpu(): void {
        this.procesoEnCpu = null;
    }

    public evaluarDesalojo(): { expulsadoPorQuantum: boolean } {
        //obtenemos los datos actuales
        const quantumActual = this.procesoEnCpu?.getQuantumConsumido() ?? 0;
        const superoQuantum = quantumActual >= this.quantumMaximo;
        const hayOtrosListos = this.colaListos.length > 0;

        //Caso A: Superó el quantum y HAY otros esperando -> Reencola y libera
        superoQuantum && hayOtrosListos && this.encolarListo(this.procesoEnCpu!);
        superoQuantum && hayOtrosListos && this.liberarCpu();

        // Caso B: Superó el quantum pero NO hay fila -> Renueva su propio quantum y sigue
        superoQuantum && !hayOtrosListos && this.procesoEnCpu?.reiniciarQuantum();

        // Retornamos true únicamente si fue desalojado para que el Simulador sepa contar el cambio de contexto
        return { expulsadoPorQuantum: superoQuantum && hayOtrosListos };
    }
}


