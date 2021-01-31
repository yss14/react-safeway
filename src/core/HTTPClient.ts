import { AxiosError, AxiosInstance, AxiosResponse } from "axios"
import { HTTPError } from "./HTTPError"

const isAxiosError = (err: any): err is AxiosError => err.isAxiosError === true

export type HTTPMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

export interface HTTPRequest<TPayload> {
	method: HTTPMethod
	url?: string
	data?: TPayload
}

export interface HTTPClientResponse<TResponse> {
	data: TResponse
	status: number
	headers?: Record<string, string>
}

export interface HTTPClient {
	request: <TPayload, TResponse>(request: HTTPRequest<TPayload>) => Promise<HTTPClientResponse<TResponse>>
}

export const AxiosHTTPClient = (axiosClient: AxiosInstance): HTTPClient => {
	const request = async <TPayload, TResponse>({ method, url, data }: HTTPRequest<TPayload>) => {
		try {
			const response: AxiosResponse<TResponse> = await axiosClient({
				method,
				url,
				data,
			})

			const httpClientResponse: HTTPClientResponse<TResponse> = {
				data: response.data,
				status: response.status,
				headers: response.headers,
			}

			return httpClientResponse
		} catch (err) {
			if (isAxiosError(err)) {
				throw new HTTPError<TResponse>(err.response?.data, err.response?.status, err.response?.headers)
			}

			throw new Error("Unknown http client error occured")
		}
	}

	return {
		request,
	}
}
