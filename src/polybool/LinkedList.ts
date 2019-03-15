// (c) Copyright 2016, Sean Connelly (@voidqk), http://syntheti.cc
// MIT License
// Project Home: https://github.com/voidqk/polybooljs

//
// simple linked list implementation that allows you to traverse down nodes and save positions
//

export class Node<T> {

    public data: T;
    public next: Node<T> | null;
    public prev: Node<T> | null;

    constructor(data: T) {
        this.prev = null;
        this.next = null;
        this.data = data;
    }

    public remove(): void {
        this.prev!.next = this.next;
        if (this.next) {
            this.next.prev = this.prev;
        }
        this.prev = null;
        this.next = null;
    }
}

export class LinkedList<T> {

    public root: { root: boolean, next: Node<T> | null };

    public isEmpty(): boolean {
        return this.root.next === null;
    }

    public getHead(): Node<T> | null {
        return this.root.next;
    }

    public insertBefore(node: Node<T>, check: any): void {
        let last = this.root as any;
        let here = this.root.next as any;
        while (here !== null) {
            if (check(here)){
                node.prev = here.prev;
                node.next = here;
                here.prev.next = node;
                here.prev = node;
                return;
            }
            last = here;
            here = here.next;
        }
        last.next = node;
        node.prev = last;
        node.next = null;
    }
    public findTransition(check: any): any {
        let prev = this.root as any;
        let here = this.root.next;
        while (here !== null) {
            if (check(here)) {
                break;
            }
            prev = here;
            here = here.next;
        }
        return {
            before: prev === this.root ? null : prev,
            after: here,
            insert: (node: any) => {
                node.prev = prev;
                node.next = here;
                prev.next = node;
                if (here !== null) {
                    here.prev = node;
                }
                return node;
            },
        };
    }

}
