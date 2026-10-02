import { BloqueMemoria } from './BloqueMemoria';

export interface IPoliticaAsignacion {
    buscarBloque(bloques: BloqueMemoria[], tamanoRequerido: number): BloqueMemoria | null;
}