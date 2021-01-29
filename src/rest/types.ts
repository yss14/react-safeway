import { HTTPMethod } from "core/HTTPClient"
import { QueryKey } from "react-query"

export interface RESTRequest<TData, TPayload> {
	method: HTTPMethod
	url: string
	payload?: TPayload
}

interface TypedRESTOperation<TData, TVar> {
	method: HTTPMethod
	url: string | ((variables: TVar) => string)
}

export interface TypedRESTQuery<TData, TVar> extends TypedRESTOperation<TData, TVar> {
	key: QueryKey | ((variables: TVar) => QueryKey)
}

export type NotAFunction<T> = T extends Function ? never : T

export interface TypedRESTMutation<TData, TVar, TPayload> extends TypedRESTOperation<TData, TVar> {
	payload?: (variables: TVar) => TPayload extends void ? never : TPayload
}

// TODO move those constructor functions to separate files
export type TypedRESTQueryArgs<TData, TVar> = Omit<TypedRESTQuery<TData, TVar>, "method">
export const RESTQuery = <TData, TVar>({ key, url }: TypedRESTQueryArgs<TData, TVar>): TypedRESTQuery<TData, TVar> => ({
	method: "GET",
	key,
	url,
})

export const RESTMutation = <TData, TVar, TPayload = TVar>(
	operation: TypedRESTMutation<TData, TVar, TPayload>,
): TypedRESTMutation<TData, TVar, TPayload> => operation
