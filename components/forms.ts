import { ChangeEvent } from "react";


/**
 * Generic input field change handler, that updates a value in the state
 * by input field name attribute.
 */
export function changeHandler(
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): void {
  const target = event.target;
  const name = target.name;
  if (!name) {
    throw new Error(
      "Missing name attribute in target input field. " +
      "Add a name attribute matching a property in the state."
    );
  }
  const update: {[key: string]: string} = {};
  update[name] = target.value;
  // @ts-ignore
  this.setState(update)
}
