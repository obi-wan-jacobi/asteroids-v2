
export default interface IComponent<T extends {}> {
    copy(): T;
    mutate(data: T): void;
}
