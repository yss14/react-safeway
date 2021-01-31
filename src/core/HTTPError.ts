export class HTTPError<TResponse = undefined> extends Error {
	data?: TResponse
	status?: number
	headers?: Record<string, string>

	constructor(data: TResponse, status?: number, headers?: Record<string, string>) {
		super()

		this.data = data
		this.status = status
		this.headers = headers
	}
}
