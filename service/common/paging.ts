

export class PageFilters {
  page: number;
  size: number;
  search?: string;
}


/**
 * Represents a paginated set of items belonging to a collection,
 * including information about the total number of items in the collection.
 * Knowing the total count of items and page size, the client can
 * calculate the number of pages necessary to display all items.
 *
 * @param items a subset of items from a collection.
 * @param total the count of items in the whole collection.
 */
export class PaginatedSet<T> {

  items: T[]
  total: number

  constructor(items: T[], total: number) {
    this.items = items
    this.total = total
  }
}
