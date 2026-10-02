import { IEstadoProceso } from './IEstadoProceso';
import { Proceso } from './Proceso';

export class EstadoNuevo implements IEstadoProceso {
    public getNombre(): string { return "NUEVO"; }

    public consumirCpu(proceso: Proceso): void { }
    public descontarBloqueo(proceso: Proceso): void { }

    public cambiarEstado(proceso: Proceso, nuevoEstado: IEstadoProceso): void {
        proceso.setEstado(nuevoEstado);
    }
}