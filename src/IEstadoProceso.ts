import { Proceso } from './Proceso';

export interface IEstadoProceso {
    getNombre(): string;
    consumirCpu(proceso: Proceso): void;
    descontarBloqueo(proceso: Proceso): void;
    cambiarEstado(proceso: Proceso, nuevoEstado: IEstadoProceso): void;

}