import { AxiosInstance, AxiosResponse } from "axios"

export type HTTPMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

export interface HTTPRequest<TPayload, TResponse> {
	method: HTTPMethod
	url?: string
	data?: TPayload
	__responseType?: TResponse
}

export type HTTPClient = ReturnType<typeof HTTPClient>

export const HTTPClient = (axiosClient: AxiosInstance) => {
	const request = async <TPayload, TResponse>({ method, url, data }: HTTPRequest<TPayload, TResponse>) => {
		const response: AxiosResponse<TResponse> = await axiosClient({
			method,
			url,
			data,
		})

		return response
	}

	return {
		request,
	}
}
