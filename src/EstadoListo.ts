import { IEstadoProceso } from './IEstadoProceso';
import { Proceso } from './Proceso';

export class EstadoListo implements IEstadoProceso {
    public getNombre(): string { return "LISTO"; }

    public consumirCpu(proceso: Proceso): void { }
    public descontarBloqueo(proceso: Proceso): void { }

    public cambiarEstado(proceso: Proceso, nuevoEstado: IEstadoProceso): void {
        proceso.setEstado(nuevoEstado);
    }
}