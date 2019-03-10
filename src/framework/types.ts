
export type Ctor<TClass, TArg> = new (arg: TArg) => TClass;
export type Indexed<T extends object> = T & { [key: string]: any };
export type Optional<T> = T | undefined;
