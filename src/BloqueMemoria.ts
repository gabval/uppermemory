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

}