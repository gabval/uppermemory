import { Proceso } from './Proceso';


export class BloqueMemoria {
    private direccionInicio: number;
    private tamanio: number;
    private procesoAsignado: Proceso | null;

    public constructor(inicio: number, tamanio: number) {
        this.direccionInicio = inicio;
        this.tamanio = tamanio;
        this.procesoAsignado = null;
    }

    public getDireccionInicio(): number {
        return this.direccionInicio;
    }
    public getTamanio(): number {
        return this.tamanio;
    }
    public getProcesoAsignado(): Proceso | null {
        return this.procesoAsignado;
    }
    public estaLibre(): boolean {
        return this.procesoAsignado === null;
    }
    //el compartamiento del bloque es asignar o liberar memoria del proceso al cual esta asignado
    public asignar(proceso: Proceso): void {
        this.procesoAsignado = proceso;
    }
    public liberar(): void {
        this.procesoAsignado = null;
    }

    // RF04: Dividir un bloque cuando sobra espacio
    public dividir(tamanoRequerido: number): BloqueMemoria | null {

        // Asignación exacta: usamos un IF normal y retornamos null
        if (this.tamanio === tamanoRequerido) {
            return null;
        }

        const tamanoSobrante = this.tamanio - tamanoRequerido;
        const nuevaDireccion = this.direccionInicio + tamanoRequerido;

        // Sobra espacio: achicamos este bloque al tamaño justo
        this.tamanio = tamanoRequerido;

        // Devolvemos el "vuelto" (el nuevo bloque libre que sobró)
        return new BloqueMemoria(nuevaDireccion, tamanoSobrante);
    }
}