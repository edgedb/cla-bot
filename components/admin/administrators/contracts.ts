// The interfaces below describe objects as they are received by the client
// (e.g. Dates are strings!).

// Objects defined in domain namespace are different as they represent
// higher level objects as they are handled by the server side.

export interface Administrator {
  id: string
  email: string
}
