import { IEstadoProceso } from './IEstadoProceso';
import { Proceso } from './Proceso';

export class EstadoEjecutando implements IEstadoProceso {
    public getNombre(): string { return "EJECUTANDO"; }

    public consumirCpu(proceso: Proceso): void {
        // Solo acá le damos la orden real al proceso de restar CPU
        proceso.reducirContadoresCpu();
    }

    public descontarBloqueo(proceso: Proceso): void { }

    public cambiarEstado(proceso: Proceso, nuevoEstado: IEstadoProceso): void {
        proceso.setEstado(nuevoEstado);
    }
}