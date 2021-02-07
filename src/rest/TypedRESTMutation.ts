import { HTTPMethod } from "../core/HTTPClient"

export interface TypedRESTMutationBase<TData, TVar, TPayload> {
	method: HTTPMethod
	__varType: TVar
	__dataType: TData
	__payloadType: TPayload
}

export interface TypedRESTMutationWithoutVariables<TData> extends TypedRESTMutationBase<TData, undefined, undefined> {}

export interface TypedRESTMutationWithVariables<TData, TVar, TPayload>
	extends TypedRESTMutationBase<TData, TVar, TPayload> {}

export type TypedRESTMutation<TData, TVar, TPayload> =
	| TypedRESTMutationWithoutVariables<TData>
	| TypedRESTMutationWithVariables<TData, TVar, TPayload>

export type TypedRESTMutationArgs = Pick<TypedRESTMutation<unknown, unknown, unknown>, "method">

export function TypedRESTMutation<TData, TVar, TPayload>(
	args: TypedRESTMutationArgs,
): TypedRESTMutationWithVariables<TData, TVar, TPayload>
export function TypedRESTMutation<TData>(args: TypedRESTMutationArgs): TypedRESTMutationWithoutVariables<TData>
export function TypedRESTMutation<TData, TVar, TPayload>(
	args: TypedRESTMutationArgs,
): TypedRESTMutation<TData, TVar, TPayload> {
	return {
		...args,
		__dataType: {} as TData,
		__varType: {} as TVar,
		__payloadType: {} as TPayload,
	}
}
