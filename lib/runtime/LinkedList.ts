namespace emnapi {

export class ListNode<E> {
  static readonly Undefined = new ListNode<any>(undefined)

  element: E
  next: ListNode<E>
  prev: ListNode<E>

  constructor (element: E) {
    this.element = element
    this.next = ListNode.Undefined
    this.prev = ListNode.Undefined
  }
}

export class LinkedList<E> {
  private _first: ListNode<E> = ListNode.Undefined
  private _last: ListNode<E> = ListNode.Undefined
  private _size: number = 0

  get size (): number {
    return this._size
  }

  isEmpty (): boolean {
    return this._first === ListNode.Undefined
  }

  clear (): void {
    this._first = ListNode.Undefined
    this._last = ListNode.Undefined
    this._size = 0
  }

  unshift (element: E): () => void {
    return this._insert(element, false)
  }

  push (element: E): () => void {
    return this._insert(element, true)
  }

  private _insert (element: E, atTheEnd: boolean): () => void {
    const newNode = new ListNode(element)
    if (this._first === ListNode.Undefined) {
      this._first = newNode
      this._last = newNode
    } else if (atTheEnd) {
      // push
      const oldLast = this._last
      this._last = newNode
      newNode.prev = oldLast
      oldLast.next = newNode
    } else {
      // unshift
      const oldFirst = this._first
      this._first = newNode
      newNode.next = oldFirst
      oldFirst.prev = newNode
    }
    this._size += 1

    let didRemove = false
    return () => {
      if (!didRemove) {
        didRemove = true
        this._remove(newNode)
      }
    }
  }

  shift (): E | undefined {
    if (this._first === ListNode.Undefined) {
      return undefined
    } else {
      const res = this._first.element
      this._remove(this._first)
      return res
    }
  }

  pop (): E | undefined {
    if (this._last === ListNode.Undefined) {
      return undefined
    } else {
      const res = this._last.element
      this._remove(this._last)
      return res
    }
  }

  private _remove (node: ListNode<E>): void {
    if (node.prev !== ListNode.Undefined && node.next !== ListNode.Undefined) {
      // middle
      const anchor = node.prev
      anchor.next = node.next
      node.next.prev = anchor
    } else if (node.prev === ListNode.Undefined && node.next === ListNode.Undefined) {
      // only node
      this._first = ListNode.Undefined
      this._last = ListNode.Undefined
    } else if (node.next === ListNode.Undefined) {
      // last
      this._last = this._last.prev!
      this._last.next = ListNode.Undefined
    } else if (node.prev === ListNode.Undefined) {
      // first
      this._first = this._first.next!
      this._first.prev = ListNode.Undefined
    }

    // done
    this._size -= 1
  }
}

}