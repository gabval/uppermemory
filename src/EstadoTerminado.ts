import { IEstadoProceso } from './IEstadoProceso';
import { Proceso } from './Proceso';

export class EstadoTerminado implements IEstadoProceso {
    public getNombre(): string { return "TERMINADO"; }

    public consumirCpu(proceso: Proceso): void { }

    public descontarBloqueo(proceso: Proceso): void { }

    public cambiarEstado(proceso: Proceso, nuevoEstado: IEstadoProceso): void {

    }
}