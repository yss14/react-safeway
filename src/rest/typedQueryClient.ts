import { QueryClient } from "react-query"
import { Updater } from "react-query/types/core/utils"
import { TypedRESTQuery } from "./types"

export class RESTQueryClient extends QueryClient {
	getTypedQueryData<TData, TVar>({ key }: TypedRESTQuery<TData, TVar>, variables: TVar): TData | undefined {
		const cachingKey = typeof key === "function" ? key(variables) : key

		return this.getQueryData<TData>(cachingKey)
	}
	setTypedQueryData<TData, TVar>(
		{ key }: TypedRESTQuery<TData, TVar>,
		variables: TVar,
		updater: TData | Updater<TData | undefined, TData>,
	): void {
		const cachingKey = typeof key === "function" ? key(variables) : key

		this.setQueryData(cachingKey, updater)
	}
	// TODO add remaining methods
}
