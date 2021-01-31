import { AxiosInstance, AxiosResponse } from "axios"

export type HTTPMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

export interface HTTPRequest<TPayload> {
	method: HTTPMethod
	url?: string
	data?: TPayload
}

export interface HTTPClientResponse<TResponse> {
	data: TResponse
	statusCode: number
	headers?: Record<string, string>
}

export interface HTTPClient {
	request: <TPayload, TResponse>(request: HTTPRequest<TPayload>) => Promise<HTTPClientResponse<TResponse>>
}

export const AxiosHTTPClient = (axiosClient: AxiosInstance): HTTPClient => {
	const request = async <TPayload, TResponse>({ method, url, data }: HTTPRequest<TPayload>) => {
		const response: AxiosResponse<TResponse> = await axiosClient({
			method,
			url,
			data,
		})

		const httpClientResponse: HTTPClientResponse<TResponse> = {
			data: response.data,
			statusCode: response.status,
			headers: response.headers,
		}

		return httpClientResponse
	}

	return {
		request,
	}
}
