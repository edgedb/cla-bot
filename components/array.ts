/**
 * Removes in place the given element from a given array.
 */
export function remove<T>(array: T[], item: T): void {
  array.splice(array.indexOf(item), 1);
}

export default {
  remove,
};
