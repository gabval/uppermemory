import { IEstadoProceso } from './IEstadoProceso';
import { Proceso } from './Proceso';

export class EstadoBloqueado implements IEstadoProceso {
    public getNombre(): string { return "BLOQUEADO"; }

    public consumirCpu(proceso: Proceso): void { }

    public descontarBloqueo(proceso: Proceso): void {
        // Solo acá le damos la orden real al proceso de restar su bloqueo
        proceso.reducirTemporizadorBloqueo();
    }

    public cambiarEstado(proceso: Proceso, nuevoEstado: IEstadoProceso): void {
        proceso.setEstado(nuevoEstado);
    }
}