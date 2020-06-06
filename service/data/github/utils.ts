import fetch from "cross-fetch";
import {expectSuccessfulResponse} from "../../common/web";
import {ServerError} from "../../common/app";

export function hasMoreItems(response: Response): boolean {
  // https://developer.github.com/v3/guides/traversing-with-pagination/

  const link = response.headers.get("link");

  if (link == null || link.indexOf(`rel="next"`) === -1) {
    // no more items
    return false;
  }

  return true;
}

export async function fetchAllItems<T>(
  url: string,
  init?: RequestInit
): Promise<T[]> {
  let pageNumber = 1;
  let items: T[] = [];

  if (url.indexOf("?") > -1) {
    // Throw exception: feature not implemented, due to missing time.
    // To support a query string in URL, proper query handling must be done.
    throw new ServerError(
      "Feature not implemented. This method does not implement handling of " +
        "query string in `url` parameter."
    );
  }

  while (true) {
    const response = await fetch(`${url}?page=${pageNumber}`, init);

    await expectSuccessfulResponse(response);

    const data: T[] = await response.json();
    items = items.concat(data);

    if (!data.length || !hasMoreItems(response)) {
      break;
    }

    pageNumber += 1;
  }

  return items;
}
