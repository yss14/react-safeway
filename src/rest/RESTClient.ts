import { HTTPClient } from "core/HTTPClient"
import { RESTRequest } from "./types"

export type RESTClient = ReturnType<typeof RESTClient>

export const RESTClient = (httpClient: HTTPClient) => {
	const request = async <TData, TPayload>({ method, url, payload }: RESTRequest<TPayload>) => {
		try {
			console.log({ payload })
			const response = await httpClient.request<TPayload, TData>({
				method,
				url,
				data: payload,
			})

			if (response.status >= 200 && response.status <= 204 && response.data) {
				return response.data
			} else {
				// TODO error handling
				throw new Error("Wrong status code returned")
			}
		} catch (err) {
			// TODO error handling
			throw err
		}
	}

	return {
		request,
	}
}
