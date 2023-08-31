interface Documento {
    id: number
    fk_tipoDoc: number
    proposito: string
    fecha: string
    monto: number
    fk_categoria: number
    categoria: Categoria
}