export interface DataStoreI<T> {

    read(id: string): T | undefined;

    write(id: string, T): void;
}