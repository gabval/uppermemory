import { IEstadoProceso } from './IEstadoProceso';
import { Proceso } from './Proceso';

export class EstadoEsperandoMemoria implements IEstadoProceso {
    public getNombre(): string { return "ESPERANDO_MEMORIA"; }

    public consumirCpu(proceso: Proceso): void { }
    public descontarBloqueo(proceso: Proceso): void { }

    public cambiarEstado(proceso: Proceso, nuevoEstado: IEstadoProceso): void {
        proceso.setEstado(nuevoEstado);
    }
}