export type Ctor<T, TArg> = new (arg: TArg) => T;
export type Indexed<T extends {}> = T & { [key: string]: any };
export type Optional<T> = T | undefined;
