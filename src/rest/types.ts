import { HTTPMethod } from "core/HTTPClient"

export interface RESTRequest<TPayload> {
	method: HTTPMethod
	url?: string
	payload?: TPayload
}
